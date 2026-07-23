import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { rewardsApi } from '../../api/rewards'
import type { SpinResult } from '../../types'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Gift, RotateCcw, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Custom Performant Confetti Piece
const ConfettiPiece = ({ index }: { index: number }) => {
  const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d', '#E63946', '#FEF08A', '#457B9D'];
  const color = colors[index % colors.length];
  const startX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : 500;
  const endX = startX + (Math.random() - 0.5) * 400;

  return (
    <motion.div
      initial={{ x: startX, y: -50, rotate: 0, opacity: 1 }}
      animate={{
        x: endX,
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 1000,
        rotate: Math.random() * 720,
        opacity: [1, 1, 0]
      }}
      transition={{ duration: Math.random() * 3 + 3, delay: Math.random() * 0.5, ease: "linear" }}
      className="fixed z-[200]"
      style={{
        width: Math.random() * 8 + 6 + 'px',
        height: Math.random() * 16 + 8 + 'px',
        backgroundColor: color,
        top: 0, left: 0,
        borderRadius: Math.random() > 0.5 ? '50%' : '0'
      }}
    />
  )
}

// Simple CSS spin wheel — no external deps
const COLORS = [
  '#C8102E', '#1A1F2E', '#e74c3c', '#252B3B',
  '#c0392b', '#2c3e50', '#e91e63', '#1a1a2e',
]

export default function SpinWheelPage() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [showWinModal, setShowWinModal] = useState(false)

  const { data: rewardsRes } = useQuery({
    queryKey: ['rewards-active'],
    queryFn: () => rewardsApi.getActive(),
  })

  // Extract data from backend response safely
  const rawData = rewardsRes?.data;
  let rewards: any[] = [];
  if (Array.isArray(rawData)) rewards = rawData;
  else if (Array.isArray((rawData as any)?.data)) rewards = (rawData as any).data;
  else if (Array.isArray((rawData as any)?.data?.data)) rewards = (rawData as any).data.data;

  // These should be returned by the backend in metadata or directly. 
  // We handle both possibilities and default to active/1 if undefined to prevent breaking before backend update.
  const metadata = (rawData as any)?.metadata || (rawData as any)?.meta || (rawData as any)?.data?.meta;
  const attempts = metadata?.attempts ?? (rawData as any)?.attempts ?? 0;
  const isWheelActive = metadata?.isActive ?? (rawData as any)?.isActive ?? true;

  // Use exactly the segments returned by the backend. 
  // If backend returns nothing, fallback to 8 dummy segments so the wheel doesn't crash.
  const segments = rewards.length > 0 ? rewards : Array.from({ length: 8 }, (_, i) => ({ id: `dummy-${i}`, displayText: `جائزة ${i + 1}` }))
  const segmentAngle = 360 / segments.length

  const spinMutation = useMutation({
    mutationFn: () => rewardsApi.spin(),
    onSuccess: (res) => {
      const spinResult = res.data.data

      // Find the winning segment (first occurrence)
      const winIndex = segments.findIndex((s: any) => s.id === spinResult.reward.id)
      const actualWinIndex = winIndex >= 0 ? winIndex : 0

      // Calculate target rotation to land on the winning segment
      const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.7)
      const targetRotation = 360 - (actualWinIndex * segmentAngle + segmentAngle / 2) + randomOffset

      // Calculate total rotation from current rotation
      const currentMod = rotation % 360
      let diff = targetRotation - currentMod
      if (diff < 0) diff += 360

      const totalRotation = rotation + 360 * 7 + diff // 7 full spins + diff for dramatic effect
      setRotation(totalRotation)

      setTimeout(() => {
        setSpinning(false)
        setResult(spinResult)
        if (spinResult.reward.type !== 'no_reward') {
          setShowWinModal(true)
        } else {
          toast.error(spinResult.message || 'حظ أوفر المرة القادمة')
        }
      }, 5000)
    },
    onError: (e: any) => {
      setSpinning(false)
      const errMsg = e?.response?.data?.message || 'لا يمكنك الدوران الآن'

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

  // Premium colors
  const PREMIUM_COLORS = ['#E63946', '#1D3557', '#F4A261', '#2A9D8F', '#6D597A', '#E07A5F']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[70vh]">

        {/* Right Column (Arabic): Info & Actions */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-right order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full px-5 py-2 text-sm font-bold mb-6 shadow-lg shadow-amber-500/30">
            <Gift className="w-5 h-5" /> عجلة الحظ اليومية
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">جرب حظك واربح!</h1>
          <p className="text-gray-500 text-lg lg:text-xl mb-10 leading-relaxed max-w-lg">
            لف العجلة واربح خصومات وهدايا مذهلة لا تفوت. استغل محاولاتك المتاحة الآن واستمتع بمفاجآتنا القيمة.
          </p>

          <div className="w-full max-w-md space-y-6">
            {/* Action Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              {!isWheelActive ? (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl border border-red-100">
                  <h3 className="font-bold text-lg mb-1">العجلة متوقفة حالياً</h3>
                  <p className="text-sm">لقد تم إيقاف عجلة الحظ مؤقتاً من قبل الإدارة. يرجى العودة لاحقاً!</p>
                </div>
              ) : typeof attempts === 'number' && attempts <= 0 ? (
                <div className="bg-gray-50 text-gray-800 p-5 rounded-2xl border border-gray-200">
                  <Gift className="w-12 h-12 text-amber-500 mx-auto lg:mx-0 mb-3 opacity-80" />
                  <h3 className="font-bold text-xl mb-2">ليس لديك محاولات!</h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    قم بعملية تسوق واحجز أوردر جديد، وسوف تحصل على محاولات جديدة لتدوير العجلة وربح هدايا وكوبونات خصم مذهلة!
                  </p>
                  <Link to="/shop" className="btn-primary w-full text-lg h-14 shadow-lg shadow-primary/20 flex items-center justify-center">
                    تسوق الآن واربح محاولات
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {typeof attempts === 'number' && (
                    <div className="bg-amber-50 text-amber-700 py-2.5 px-5 rounded-xl inline-flex items-center justify-center font-bold text-lg border border-amber-200/50 w-full lg:w-auto">
                      لديك ({attempts}) محاولات متبقية
                    </div>
                  )}
                  <button
                    onClick={handleSpin}
                    disabled={spinning || spinMutation.isPending || segments.length === 0}
                    className="btn-primary w-full text-xl font-bold h-16 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <RotateCcw className={`w-6 h-6 ${spinning ? 'animate-spin' : ''}`} />
                    <span>{spinning ? 'جاري الدوران...' : 'لف العجلة الآن!'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Result */}
            {result && (
              <div className={`card p-6 w-full text-center border-2 shadow-2xl animate-fade-in ${result.reward.type === 'no_reward' ? 'border-gray-200 bg-gray-50' : 'border-amber-400 bg-amber-50/50'}`}>
                <div className="text-5xl mb-4">
                  {result.reward.type === 'no_reward' ? '😔' : '🎉'}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.reward.displayText}</h3>
                {result.message && (
                  <p className="text-gray-600 text-base mb-4">{result.message}</p>
                )}
                {result.coupon && (
                  <div className="mt-4 bg-white border border-amber-200 rounded-2xl p-5 shadow-inner">
                    <p className="text-sm text-gray-500 mb-2 font-medium">كود الكوبون الخاص بك:</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl font-mono font-black text-amber-600 tracking-wider bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">{result.coupon.code}</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(result.coupon!.code); toast.success('تم النسخ!') }}
                        className="text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 p-3 rounded-lg transition-colors border border-amber-100"
                        title="نسخ الكوبون"
                      >
                        📋
                      </button>
                    </div>
                    {result.reward.description && (
                      <p className="text-sm text-gray-400 mt-3">{result.reward.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Available prizes */}
            {rewards.length > 0 && (
              <div className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/40 mt-6">
                <h2 className="font-extrabold text-xl text-gray-900 mb-5 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-amber-500" />
                  الجوائز المتاحة في العجلة
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rewards.map((r: any, idx: number) => (
                    <div key={r.id} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors shadow-sm">
                      <div className="w-3.5 h-3.5 mt-1 rounded-full shrink-0 shadow-inner ring-4 ring-white" style={{ background: PREMIUM_COLORS[idx % PREMIUM_COLORS.length] }} />
                      <span className="text-sm text-gray-800 font-bold leading-relaxed">{r.displayText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left Column (Arabic): The Wheel */}
        <div className="flex flex-col items-center justify-start relative py-4 order-1 lg:order-2 w-full lg:-mt-36">
          <div className="relative w-[115%] aspect-square sm:w-[500px] sm:h-[500px] md:w-[650px] md:h-[650px]">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-amber-500/20 blur-[80px] rounded-full scale-110 pointer-events-none" />

            {/* Wheel SVG Container - Split into Layers to fix SVG transform bugs */}
            <div
              className={`w-full h-full relative transition-opacity duration-700 ${isWheelActive ? 'opacity-100' : 'opacity-60'}`}
            >
              {/* Layer 1: Background (Pedestal and Outer Rim) */}
              <div className="absolute inset-0 z-10">
                <svg viewBox="-150 -150 300 330" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFE066" />
                      <stop offset="30%" stopColor="#D4AF37" />
                      <stop offset="50%" stopColor="#FFF5BA" />
                      <stop offset="70%" stopColor="#AA7A00" />
                      <stop offset="100%" stopColor="#FFE066" />
                    </linearGradient>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
                    </filter>
                    <filter id="shadow-sm">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                    </filter>
                  </defs>

                  {/* Pedestal (Base) */}
                  <path d="M -45 110 L 45 110 L 45 155 L -45 155 Z" fill="#0f172a" />
                  <path d="M -75 115 L 75 115 L 95 155 L -95 155 Z" fill="#1e293b" />
                  <path d="M -70 115 L 70 115 L 90 155 L -90 155 Z" fill="#1D3557" />
                  <path d="M -100 155 L 100 155 L 100 162 L -100 162 Z" fill="url(#goldGradient)" filter="url(#shadow-sm)" />
                  <path d="M -105 162 L 105 162 L 105 165 L -105 165 Z" fill="#020617" />

                  {/* Outer Rim */}
                  <circle cx="0" cy="0" r="115" fill="#1D3557" filter="url(#shadow)" />
                  <circle cx="0" cy="0" r="98" fill="none" stroke="url(#goldGradient)" strokeWidth="4" />
                  <circle cx="0" cy="0" r="113" fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" />

                  {/* Lights */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const lx = 105.5 * Math.cos(angle);
                    const ly = 105.5 * Math.sin(angle);
                    const isEven = i % 2 === 0;

                    return (
                      <g key={`light-${i}`}>
                        {/* Base Socket (Navy with Golden Ring) */}
                        <circle cx={lx} cy={ly} r="5" fill="#0f172a" />
                        <circle cx={lx} cy={ly} r="5" fill="none" stroke="url(#goldGradient)" strokeWidth="1.5" />

                        {/* Animated Glowing Bulb (Slow Breathing Effect) */}
                        <g>
                          <animate
                            attributeName="opacity"
                            values={isEven ? "1;0.4;1" : "0.4;1;0.4"}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                          {/* Fake Glow (Hardware friendly) */}
                          <circle cx={lx} cy={ly} r="6" fill="#FEF08A" opacity="0.35" />
                          <circle cx={lx} cy={ly} r="3.5" fill="#FEF08A" />
                          <circle cx={lx} cy={ly} r="2" fill="#FFFFFF" />
                        </g>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Layer 2: Spinning Slices */}
              <div
                className="absolute inset-0 z-20"
                style={{
                  transition: spinning ? 'transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none',
                  transform: `rotate(${rotation}deg) translateZ(0)`,
                  willChange: 'transform',
                }}
              >
                <svg viewBox="-150 -150 300 330" className="w-full h-full">
                  <defs>
                    <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFE066" />
                      <stop offset="50%" stopColor="#FFF5BA" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                    <radialGradient id="slice-grad-0" cx="0" cy="0" r="96" gradientUnits="userSpaceOnUse">
                      <stop offset="20%" stopColor="#ffbf66" />
                      <stop offset="100%" stopColor="#d96600" />
                    </radialGradient>
                    <radialGradient id="slice-grad-1" cx="0" cy="0" r="96" gradientUnits="userSpaceOnUse">
                      <stop offset="20%" stopColor="#ff6666" />
                      <stop offset="100%" stopColor="#cc1122" />
                    </radialGradient>
                    <radialGradient id="slice-grad-2" cx="0%" cy="0%" r="100%" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#224488" />
                      <stop offset="100%" stopColor="#112244" />
                    </radialGradient>
                  </defs>

                  {segments.map((seg: any, idx: number) => {
                    const startAngle = idx * segmentAngle - 90
                    const endAngle = (idx + 1) * segmentAngle - 90
                    const startRad = (startAngle * Math.PI) / 180
                    const endRad = (endAngle * Math.PI) / 180

                    const radius = 96;
                    const x1 = radius * Math.cos(startRad)
                    const y1 = radius * Math.sin(startRad)
                    const x2 = radius * Math.cos(endRad)
                    const y2 = radius * Math.sin(endRad)

                    const largeArc = segmentAngle > 180 ? 1 : 0;
                    const path = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180

                    // Text is now perfectly centered since icons are moved to the background
                    const tx = 65 * Math.cos(midAngle)
                    const ty = 65 * Math.sin(midAngle)
                    const ix = 65 * Math.cos(midAngle)
                    const iy = 65 * Math.sin(midAngle)

                    const label = seg.displayText ?? `جائزة ${idx + 1}`

                    const words = label.split(' ')
                    const lines: string[] = []
                    let currentLine = ''
                    words.forEach((word: string) => {
                      if ((currentLine + ' ' + word).length > 14) {
                        if (currentLine) lines.push(currentLine)
                        currentLine = word
                      } else {
                        currentLine = currentLine ? `${currentLine} ${word}` : word
                      }
                    })
                    if (currentLine) lines.push(currentLine)

                    let textRot = (midAngle * 180) / Math.PI;
                    textRot = (textRot % 360 + 360) % 360;

                    if (textRot > 90 && textRot < 270) {
                      textRot += 180;
                    }

                    const isShort = label.length <= 12;
                    const fontSize = isShort ? "12" : "9";
                    const gradId = `url(#slice-grad-${idx % 3})`;

                    return (
                      <g key={`${seg.id}-${idx}`}>
                        {/* Slice Base */}
                        <path d={path} fill={gradId} stroke="#0f172a" strokeWidth="2.5" />
                        <path d={path} fill="none" stroke="url(#goldGradient2)" strokeWidth="1.5" opacity="0.9" />

                        {/* Background Watermark Icons (Huge, Faint, behind text) */}
                        <g transform={`translate(${ix}, ${iy}) rotate(${textRot}) scale(2.8) translate(-12, -12)`} opacity="0.12">
                          {(label.includes('خصم') || label.includes('%')) ? (
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (label.includes('ربح') || label.includes('منتج') || label.includes('هدية')) ? (
                            <path d="M12 22v-9m0 0V3M12 13H3m9 0h9M3 13h18M5 13c-.667 0-1.5-.667-2-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H5zm14 0c.667 0 1.5-.667 2-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2h6z" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          ) : (
                            <path d="M12 2L15 9L22 9L16 14L18 21L12 17L6 21L8 14L2 9L9 9L12 2Z" fill="#FFFFFF" />
                          )}
                        </g>

                        {/* Confetti */}
                        <g opacity="0.4" fill="#FFFFFF">
                          <polygon points={`${70 * Math.cos(startRad + 0.2)},${70 * Math.sin(startRad + 0.2)} ${74 * Math.cos(startRad + 0.22)},${68 * Math.sin(startRad + 0.22)} ${72 * Math.cos(startRad + 0.26)},${72 * Math.sin(startRad + 0.26)}`} />
                          <circle cx={80 * Math.cos(endRad - 0.2)} cy={80 * Math.sin(endRad - 0.2)} r="1.5" />
                          <polygon points={`${40 * Math.cos(startRad + 0.15)},${40 * Math.sin(startRad + 0.15)} ${43 * Math.cos(startRad + 0.18)},${38 * Math.sin(startRad + 0.18)} ${41 * Math.cos(startRad + 0.2)},${42 * Math.sin(startRad + 0.2)}`} fill="#FEF08A" />
                          <circle cx={50 * Math.cos(endRad - 0.4)} cy={50 * Math.sin(endRad - 0.4)} r="2" fill="#FEF08A" />
                        </g>

                        {/* Text - Inheriting the App's Arabic Font! */}
                        <text
                          x={tx}
                          y={ty}
                          fill="white"
                          fontSize={fontSize}
                          fontWeight="900"
                          fontFamily="inherit"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textRot}, ${tx}, ${ty})`}
                          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}
                        >
                          {lines.map((line, i) => {
                            const dy = i === 0 ? -((lines.length - 1) * 4.5) : 9;
                            return <tspan key={i} x={tx} dy={dy}>{line}</tspan>
                          })}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Layer 3: Foreground (Center Axis and Pointer) */}
              <div className="absolute inset-0 z-30 pointer-events-none">
                <svg viewBox="-150 -150 300 330" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="goldGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFE066" />
                      <stop offset="30%" stopColor="#D4AF37" />
                      <stop offset="50%" stopColor="#FFF5BA" />
                      <stop offset="70%" stopColor="#AA7A00" />
                      <stop offset="100%" stopColor="#FFE066" />
                    </linearGradient>
                    <linearGradient id="goldGradientLight3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FEF08A" />
                      <stop offset="50%" stopColor="#FFF5BA" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                    <filter id="shadow3">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Center Static Axis */}
                  <circle cx="0" cy="0" r="22" fill="#1D3557" filter="url(#shadow3)" />
                  <circle cx="0" cy="0" r="22" fill="none" stroke="url(#goldGradient3)" strokeWidth="6" />
                  <circle cx="0" cy="0" r="10" fill="url(#goldGradientLight3)" filter="url(#shadow3)" />
                  <circle cx="0" cy="0" r="4" fill="#A16207" />

                  {/* Golden Pin Pointer */}
                  <g transform="translate(0, -112)" filter="url(#shadow3)">
                    <path d="M 0 -26 C -14 -26 -22 -14 -22 0 C -22 14 0 34 0 34 C 0 34 22 14 22 0 C 22 -14 14 -26 0 -26 Z" fill="url(#goldGradient3)" />
                    <circle cx="0" cy="-4" r="7" fill="#1e293b" />
                    <circle cx="0" cy="-4" r="5" fill="#FEF08A" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Massive Celebration Modal with Confetti */}
      <AnimatePresence>
        {showWinModal && result && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Dark Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
              onClick={() => setShowWinModal(false)}
            />

            {/* Confetti Explosion (Render 40 pieces for performance) */}
            {Array.from({ length: 40 }).map((_, i) => <ConfettiPiece key={i} index={i} />)}

            {/* The Win Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden z-[160] border-2 border-amber-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-50 pointer-events-none" />

              <div className="relative z-10 w-full">
                {/* Glowing Gift Icon */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)] mb-6 border-4 border-amber-200 relative">
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }}>
                    <Gift className="w-12 h-12 text-white" />
                  </motion.div>
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">ألف مبروك! 🎉</h2>
                <p className="text-lg text-slate-600 mb-8 font-medium">لقد ربحت معنا في عجلة الحظ</p>

                {/* Prize Box */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-8 shadow-inner transform hover:scale-105 transition-transform cursor-default relative overflow-hidden group">
                  <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-white/20 transform -skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
                  <span className="text-2xl font-black text-white drop-shadow-md block">{result.reward?.displayText}</span>
                </div>

                <button
                  onClick={() => setShowWinModal(false)}
                  className="w-full bg-slate-900 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all transform hover:-translate-y-1 active:translate-y-0"
                >
                  استلام الجائزة الآن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
