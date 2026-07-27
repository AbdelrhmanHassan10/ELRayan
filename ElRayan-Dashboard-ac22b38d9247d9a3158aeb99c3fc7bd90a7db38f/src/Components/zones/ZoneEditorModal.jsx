import React, { useRef, useEffect, useState } from "react";
import { Modal, Input, Space, Switch, Button, Form, message } from "antd";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { extractLatLngsFromPolygon } from "../../utils/coords";
import { MapPin, DollarSign, Activity, Sparkles } from "lucide-react";

const toGeoJsonPolygonCoords = (latlngs) => {
  if (!latlngs || !Array.isArray(latlngs)) return [];

  const flatten = (arr) => {
    if (Array.isArray(arr[0]) && typeof arr[0][0] === "number") return arr;
    return flatten(arr[0]);
  };

  const clean = flatten(latlngs);
  const ring = clean.map(([lat, lng]) => [lng, lat]);

  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);

  return [ring];
};

export default function ZoneEditorModal({ visible, onClose, onSubmit, initialZone, loading }) {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [polygonLatLngs, setPolygonLatLngs] = useState([]);
  const featureGroupRef = useRef(null);
  const mapRef = useRef(null);
  const isArabic = i18n.language === "ar";
  const currency = isArabic ? "ج.م" : "EGP";

  const defaultCenter = [30.033333, 31.233334];

  useEffect(() => {
    const featureGroup = featureGroupRef.current;
    let pts = [];

    if (featureGroup) featureGroup.clearLayers();

    if (initialZone) {
      form.setFieldsValue({
        name: initialZone.name,
        isActive: initialZone.isActive,
        shippingCost: initialZone.shippingCost,
      });

      pts = extractLatLngsFromPolygon(initialZone.polygon);
      setPolygonLatLngs(pts);
    } else {
      form.resetFields();
      setPolygonLatLngs([]);
    }

    if (visible) {
      setTimeout(() => {
        const map = mapRef.current;
        if (map) {
          map.invalidateSize();
          map.setView(
            pts.length ? pts[Math.floor(pts.length / 2)] : defaultCenter,
            13
          );
        }
      }, 150);
    }
  }, [initialZone, visible]);

  useEffect(() => {
    if (!visible) return;

    setTimeout(() => {
      const map = mapRef.current;
      const fg = featureGroupRef.current;

      if (map) map.invalidateSize();

      if (fg) {
        fg.clearLayers();

        if (polygonLatLngs.length >= 3) {
          const layer = L.polygon(polygonLatLngs, { color: "#9f1239", fillColor: "#9f1239", fillOpacity: 0.25, weight: 3 });
          fg.addLayer(layer);
          if (layer.editing) layer.editing.enable();
        }
      }
    }, 250);
  }, [visible, polygonLatLngs]);

  const handleCreated = (e) => {
    const layer = e.layer;
    layer.setStyle({ color: "#9f1239", fillColor: "#9f1239", fillOpacity: 0.25, weight: 3 });
    const latlngs = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);

    setPolygonLatLngs(latlngs);

    featureGroupRef.current.clearLayers();
    featureGroupRef.current.addLayer(layer);
  };

  const handleEdited = (e) => {
    e.layers.eachLayer(layer => {
      const latlngs = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
      setPolygonLatLngs(latlngs);
    });
  };

  const handleDeleted = () => setPolygonLatLngs([]);

  const submit = async () => {
    try {
      const values = await form.validateFields();

      if (!polygonLatLngs || polygonLatLngs.length < 3) {
        message.error(t("zones.draw_polygon") || (isArabic ? "يرجى رسم مضلع المنطقة على الخريطة أولاً" : "Please draw a valid polygon on the map"));
        return;
      }

      const body = {
        name: values.name,
        polygon: {
          type: "Polygon",
          coordinates: [toGeoJsonPolygonCoords(polygonLatLngs)[0]]
        },
        isActive: values.isActive !== undefined ? values.isActive : true,
        shippingCost: values.shippingCost || "0.00"
      };

      await onSubmit(body);
    } catch (err) { }
  };

  const center =
    polygonLatLngs.length
      ? polygonLatLngs[Math.floor(polygonLatLngs.length / 2)]
      : defaultCenter;

  return (
    <Modal 
      open={visible} 
      onCancel={onClose} 
      title={
        <div className="flex items-center gap-2.5 text-lg font-black text-slate-800 pb-3 border-b border-slate-100">
          <span className="p-2.5 rounded-xl bg-[#9f1239]/10 text-[#9f1239]">
            <MapPin size={18} />
          </span>
          <span>{initialZone ? (t("zones.edit_zone") || (isArabic ? "تعديل بيانات نطاق الشحن" : "Edit Zone")) : (t("zones.add_zone") || (isArabic ? "إضافة منطقة شحن جديدة" : "Add New Zone"))}</span>
        </div>
      } 
      footer={null} 
      width={950}
      className="rounded-3xl overflow-hidden"
    >
      <Form layout="vertical" form={form} className="pt-3" dir={isArabic ? "rtl" : "ltr"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="name" label={<span className="font-bold text-slate-700 text-xs">{t("zones.name") || (isArabic ? "اسم المنطقة الجغرافية" : "Zone Name")}</span>} rules={[{ required: true, message: isArabic ? "يرجى إدخال اسم المنطقة" : "Please enter zone name" }]} className="md:col-span-2">
            <Input placeholder={isArabic ? "مثال: منطقة القاهرة الجديدة والتجمع..." : "Enter zone name..."} className="h-11 rounded-xl font-medium" />
          </Form.Item>

          <Form.Item name="shippingCost" label={<span className="font-bold text-slate-700 text-xs">{isArabic ? "رسوم الشحن والتوصيل" : "Shipping Cost"}</span>} rules={[{ required: true, message: isArabic ? "يرجى تحديد رسوم الشحن" : "Please enter shipping cost" }]}>
            <Input prefix={<span className="font-black text-[#9f1239] text-xs me-1">{currency}</span>} type="number" step="0.01" min="0" placeholder="0.00" className="h-11 rounded-xl font-bold" />
          </Form.Item>
        </div>

        <Form.Item name="isActive" label={<span className="font-bold text-slate-700 text-xs">{t("zones.active") || (isArabic ? "تفعيل المنطقة فور الحفظ" : "Active Status")}</span>} valuePropName="checked" initialValue={true}>
          <Switch style={{ background: form.getFieldValue("isActive") !== false ? "#9f1239" : "#cbd5e1" }} />
        </Form.Item>

        <div className="mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-[#9f1239] text-xs font-bold flex items-center gap-2.5 shadow-2xs">
          <Sparkles size={16} className="shrink-0" />
          <span>{isArabic ? "إرشادات الخريطة: استخدم أداة رسم المضلع (Polygon) في أعلى يمين الخريطة لتحديد حدود المنطقة بدقة. يمكنك تعديل النقاط بالسحب بعد الرسم." : "Map Instructions: Use the polygon drawing tool in the top right to accurately outline the delivery zone boundary."}</span>
        </div>

        <div className="h-[450px] mb-5 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <MapContainer
            key={initialZone ? initialZone.id : "add"}
            ref={mapRef}
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  rectangle: false,
                  polyline: false,
                  circle: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button onClick={onClose} className="h-11 px-5 rounded-xl font-bold">
            {t("common.cancel") || (isArabic ? "إلغاء" : "Cancel")}
          </Button>
          <Button type="primary" onClick={submit} loading={loading} className="h-11 px-7 bg-[#9f1239] hover:bg-[#881337] text-white rounded-xl font-bold shadow-md shadow-[#9f1239]/25 border-0">
            {initialZone ? (t("common.save") || (isArabic ? "حفظ التعديلات" : "Save Changes")) : (t("common.add") || (isArabic ? "إضافة المنطقة" : "Add Zone"))}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

