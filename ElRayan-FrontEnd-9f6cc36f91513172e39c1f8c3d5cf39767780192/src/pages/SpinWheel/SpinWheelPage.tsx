import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { rewardsApi } from '../../api/rewards'
import type { SpinResult } from '../../types'
import toast from 'react-hot-toast'
import { Gift, RotateCcw, CheckCircle } from 'lucide-react'

// Simple CSS spin wheel — no external deps
const COLORS = [
  '#C8102E', '#1A1F2E', '#e74c3c', '#252B3B',
  '#c0392b', '#2c3e50', '#e91e63', '#1a1a2e',
]

export default function SpinWheelPage() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<SpinResult | null>(null)

  const { data: rewardsRes } = useQuery({
    queryKey: ['rewards-active'],
    queryFn: () => rewardsApi.getActive(),
  })
  const rewards = rewardsRes?.data?.data ?? []

  const segments = rewards.length > 0 ? rewards : Array.from({ length: 8 }, (_, i) => ({ id: i, displayText: `جائزة ${i + 1}` }))
  const segmentAngle = 360 / segments.length

  const spinMutation = useMutation({
    mutationFn: () => rewardsApi.spin(),
    onSuccess: (res) => {
      const spinResult = res.data.data
      
      // Find the winning segment
      const winIndex = segments.findIndex((s: any) => s.id === spinResult.reward.id)
      const actualWinIndex = winIndex >= 0 ? winIndex : 0

      // Calculate target rotation to land on the winning segment
      const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.7)
      const targetRotation = 360 - (actualWinIndex * segmentAngle + segmentAngle / 2) + randomOffset

      // Calculate total rotation from current rotation
      const currentMod = rotation % 360
      let diff = targetRotation - currentMod
      if (diff < 0) diff += 360

      const totalRotation = rotation + 360 * 5 + diff // 5 full spins + diff
      setRotation(totalRotation)

      setTimeout(() => {
        setSpinning(false)
        setResult(spinResult)
        if (spinResult.reward.type !== 'no_reward') {
          toast.success(spinResult.message || 'لقد فزت بجائزة!')
        }
      }, 3500)
    },
    onError: (e: any) => {
      setSpinning(false)
      const errMsg = e?.response?.data?.message || 'لا يمكنك الدوران الآن'
      
      // Translate known backend errors to Arabic for better UX
      if (errMsg.toLowerCase().includes('no spin attempts')) {
        toast.error('لقد استنفذت محاولات الدوران المتاحة لك اليوم')
      } else {
        toast.error(errMsg)
      }
    },
  })

  const handleSpin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    spinMutation.mutate()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Gift className="w-4 h-4" /> عجلة الحظ اليومية
        </div>
        <h1 className="text-3xl font-bold text-gray-900">جرب حظك!</h1>
        <p className="text-gray-400 mt-2">لف العجلة واربح خصومات وجوائز مذهلة</p>
      </div>

      {/* Wheel */}
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-primary drop-shadow-lg" />
          </div>

          {/* Wheel SVG */}
          <div
            className="w-72 h-72 md:w-80 md:h-80 rounded-full shadow-2xl overflow-hidden border-4 border-white"
            style={{
              transition: spinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {segments.map((seg: any, idx: number) => {
                const startAngle = idx * segmentAngle - 90
                const endAngle = (idx + 1) * segmentAngle - 90
                const startRad = (startAngle * Math.PI) / 180
                const endRad = (endAngle * Math.PI) / 180
                const x1 = 100 + 100 * Math.cos(startRad)
                const y1 = 100 + 100 * Math.sin(startRad)
                const x2 = 100 + 100 * Math.cos(endRad)
                const y2 = 100 + 100 * Math.sin(endRad)
                const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180
                const tx = 100 + 65 * Math.cos(midAngle)
                const ty = 100 + 65 * Math.sin(midAngle)

                const label = seg.displayText ?? `جائزة ${idx + 1}`
                const shortLabel = label.length > 15 ? label.slice(0, 14) + '…' : label

                return (
                  <g key={seg.id ?? idx}>
                    <path
                      d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="white"
                      strokeWidth="1"
                    />
                    <text
                      x={tx}
                      y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="7"
                      fontWeight="bold"
                      transform={`rotate(${startAngle + segmentAngle / 2 + 90}, ${tx}, ${ty})`}
                    >
                      {shortLabel}
                    </text>
                  </g>
                )
              })}
              <circle cx="100" cy="100" r="10" fill="white" />
            </svg>
          </div>
        </div>

        {/* Spin button */}
        <button
          onClick={handleSpin}
          disabled={spinning || spinMutation.isPending}
          className="btn-primary flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-2xl shadow-lg shadow-primary/30 disabled:opacity-50"
        >
          <RotateCcw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'جاري الدوران...' : 'لف العجلة!'}
        </button>

        {/* Result */}
        {result && (
          <div className={`card p-6 w-full text-center border-2 ${result.reward.type === 'no_reward' ? 'border-gray-200' : 'border-primary/30'}`}>
            <div className="text-4xl mb-3">
              {result.reward.type === 'no_reward' ? '😔' : '🎉'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{result.reward.displayText}</h3>
            {result.message && (
              <p className="text-gray-500 text-sm mb-3">{result.message}</p>
            )}
            {result.coupon && (
              <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">كود الكوبون الخاص بك:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-mono font-bold text-primary tracking-wider">{result.coupon.code}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(result.coupon!.code); toast.success('تم النسخ!') }}
                    className="text-primary hover:text-primary-600 transition-colors"
                  >
                    📋
                  </button>
                </div>
                {result.reward.description && (
                  <p className="text-xs text-gray-400 mt-2">{result.reward.description}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Available prizes */}
        {rewards.length > 0 && (
          <div className="w-full">
            <h2 className="font-bold text-gray-900 mb-3">الجوائز المتاحة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {rewards.map((r: any, idx: number) => (
                <div key={r.id} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs text-gray-600 font-medium truncate">{r.displayText}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
