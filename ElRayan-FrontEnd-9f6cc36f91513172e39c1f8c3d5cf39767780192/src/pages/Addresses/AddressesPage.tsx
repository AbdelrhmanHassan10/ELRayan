import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, MapPin, Star, Edit2, X, Check, Navigation } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { addressesApi } from '../../api/addresses'
import type { CreateAddressPayload, AddressType } from '../../types'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'
import 'leaflet/dist/leaflet.css'

const ADDRESS_TYPE_LABELS: Record<AddressType, string> = {
  home: 'منزل',
  work: 'عمل',
  other: 'أخرى',
}

const ADDRESS_TYPES: AddressType[] = ['home', 'work', 'other']

// Default center: شارع المستشفى، الفشن، بني سويف، مصر
const DEFAULT_LAT = 28.8222
const DEFAULT_LNG = 30.8983

// Delivery zone config
const ZONE_CENTER_LAT = 28.8222
const ZONE_CENTER_LNG = 30.8983
const ZONE_RADIUS_KM = 15 // نطاق التوصيل بالكيلومتر

// Haversine formula to calculate distance between two points
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface MapPickerProps {
  initialLat?: number
  initialLng?: number
  onSelect: (lat: number, lng: number, address?: string) => void
  onZoneCheck?: (isInZone: boolean) => void
}

function MapPicker({ initialLat, initialLng, onSelect, onZoneCheck }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [address, setAddress] = useState('')

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'ar' } }
      )
      const data = await res.json()
      return data.display_name ?? ''
    } catch {
      return ''
    }
  }

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    import('leaflet').then(L => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const startLat = initialLat ?? DEFAULT_LAT
      const startLng = initialLng ?? DEFAULT_LNG

      const map = L.map(mapRef.current!, { zoomControl: true }).setView([startLat, startLng], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map)
      markerRef.current = marker

      // Draw delivery zone circle
      L.circle([ZONE_CENTER_LAT, ZONE_CENTER_LNG], {
        radius: ZONE_RADIUS_KM * 1000,
        color: '#8B1A2B',
        fillColor: '#8B1A2B',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '8 4',
      }).addTo(map)

      const handleMove = async (lat: number, lng: number) => {
        const addr = await reverseGeocode(lat, lng)
        setAddress(addr)
        onSelect(lat, lng, addr)
        const dist = getDistanceKm(lat, lng, ZONE_CENTER_LAT, ZONE_CENTER_LNG)
        onZoneCheck?.(dist <= ZONE_RADIUS_KM)
      }

      handleMove(startLat, startLng)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        handleMove(pos.lat, pos.lng)
      })

      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng)
        handleMove(e.latlng.lat, e.latlng.lng)
      })

      leafletMap.current = map
    })

    return () => {
      leafletMap.current?.remove()
      leafletMap.current = null
    }
  }, [])

  const locateMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords
      leafletMap.current?.setView([latitude, longitude], 15)
      markerRef.current?.setLatLng([latitude, longitude])
      const addr = await reverseGeocode(latitude, longitude)
      setAddress(addr)
      onSelect(latitude, longitude, addr)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">الموقع على الخريطة *</label>
        <button
          type="button"
          onClick={locateMe}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Navigation className="w-3 h-3" /> موقعي الحالي
        </button>
      </div>
      <div ref={mapRef} className="w-full h-56 rounded-xl border border-gray-200 z-0" style={{ direction: 'ltr' }} />
      {address && (
        <p className="text-xs text-gray-400 truncate">{address}</p>
      )}
      <p className="text-xs text-gray-400">انقر على الخريطة أو اسحب العلامة لاختيار الموقع</p>
    </div>
  )
}

export default function AddressesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [coordsError, setCoordsError] = useState(false)
  const [isInZone, setIsInZone] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll(),
  })
  const addresses = data?.data?.data ?? []

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateAddressPayload & { type: AddressType }>({
    defaultValues: { type: 'home' },
  })

  const createMutation = useMutation({
    mutationFn: (d: CreateAddressPayload) => addressesApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      reset()
      setShowForm(false)
      setCoords(null)
      toast.success('تم إضافة العنوان!')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'فشل'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAddressPayload> }) =>
      addressesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      reset()
      setEditId(null)
      setShowForm(false)
      setCoords(null)
      toast.success('تم تحديث العنوان!')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'فشل'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('تم حذف العنوان')
    },
    onError: () => toast.error('فشل الحذف'),
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => addressesApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('تم تحديث العنوان الافتراضي')
    },
  })

  const onSubmit = (formData: CreateAddressPayload & { type: AddressType }) => {
    if (!coords) {
      setCoordsError(true)
      return
    }
    if (!isInZone) {
      toast.error('الموقع المحدد خارج نطاق التوصيل (الفشن، بني سويف). يرجى اختيار موقع داخل النطاق.')
      return
    }
    setCoordsError(false)
    const payload = { ...formData, latitude: coords.lat, longitude: coords.lng }
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const startEdit = (addr: typeof addresses[0]) => {
    setEditId(addr.id)
    setValue('type', addr.type)
    setValue('title', addr.title ?? '')
    setValue('description', addr.description ?? '')
    if (addr.latitude && addr.longitude) {
      setCoords({ lat: Number(addr.latitude), lng: Number(addr.longitude) })
    }
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setCoords(null)
    setCoordsError(false)
    reset()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Zone info banner */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl mb-6 flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">نطاق التوصيل: مركز الفشن، بني سويف</p>
          <p className="text-xs text-gray-500 mt-0.5">نقوم بالتوصيل في نطاق {ZONE_RADIUS_KM} كم من مركز الفشن. يرجى اختيار عنوان داخل هذا النطاق.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">عناويني</h1>
        <button
          onClick={() => { setShowForm(v => !v); setEditId(null); setCoords(null); reset(); setIsInZone(true) }}
          className="btn-primary flex items-center gap-2 py-2 text-sm"
        >
          <Plus className="w-4 h-4" /> إضافة عنوان
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editId ? 'تعديل العنوان' : 'عنوان جديد'}</h2>
            <button onClick={cancelForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
              <select {...register('type')} className="input">
                {ADDRESS_TYPES.map(t => <option key={t} value={t}>{ADDRESS_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم / العنوان</label>
              <input {...register('title')} placeholder="مثل: المنزل، المكتب" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التفاصيل / العنوان الكامل</label>
              <textarea {...register('description')} rows={2} placeholder="تفاصيل العنوان الكامل" className="input resize-none" />
            </div>

            {/* Map picker */}
            <MapPicker
              initialLat={coords?.lat}
              initialLng={coords?.lng}
              onSelect={(lat, lng) => {
                setCoords({ lat, lng })
                setCoordsError(false)
              }}
              onZoneCheck={(inZone) => setIsInZone(inZone)}
            />
            {coordsError && (
              <p className="text-xs text-red-500 -mt-2">يرجى تحديد موقعك على الخريطة</p>
            )}
            {!isInZone && coords && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 -mt-1">
                <span className="text-lg">⚠️</span>
                <span>هذا الموقع خارج نطاق التوصيل (مركز الفشن، بني سويف). يرجى اختيار موقع داخل الدائرة المحددة.</span>
              </div>
            )}
            {coords && (
              <p className="text-xs text-gray-400">
                الإحداثيات: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={cancelForm} className="btn-ghost text-sm">إلغاء</button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="btn-primary text-sm flex items-center gap-2 py-2"
              >
                {(createMutation.isPending || updateMutation.isPending)
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />
                }
                {editId ? 'تحديث' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-600">لا توجد عناوين محفوظة</p>
          <p className="text-sm text-gray-400 mt-1">أضف أول عنوان توصيل</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr: any) => (
            <div key={addr.id} className={`card p-4 flex items-start gap-3 ${addr.isDefault ? 'border-2 border-primary/30' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{addr.title || ADDRESS_TYPE_LABELS[addr.type as AddressType] || addr.type}</span>
                  <span className="badge bg-gray-100 text-gray-500 text-xs">{ADDRESS_TYPE_LABELS[addr.type as AddressType] || addr.type}</span>
                  {addr.isDefault && <span className="badge bg-primary/10 text-primary text-xs">الافتراضي</span>}
                </div>
                {addr.description && <p className="text-sm text-gray-400 mt-0.5 truncate">{addr.description}</p>}
                {addr.zone && <p className="text-xs text-primary mt-0.5">المنطقة: {addr.zone.name} • الشحن: {addr.zone.shippingCost} ج.م</p>}
                {addr.latitude && addr.longitude && (
                  <p className="text-xs text-gray-300 mt-0.5">{Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultMutation.mutate(addr.id)}
                    className="p-1.5 text-gray-300 hover:text-yellow-500 transition-colors"
                    title="تعيين كافتراضي"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => startEdit(addr)} className="p-1.5 text-gray-300 hover:text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(addr.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="حذف العنوان"
        message="هل أنت متأكد من رغبتك في حذف هذا العنوان نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف العنوان"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId)
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  )
}
