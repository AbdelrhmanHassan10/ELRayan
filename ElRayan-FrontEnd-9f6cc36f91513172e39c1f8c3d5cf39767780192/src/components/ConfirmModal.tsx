import { X, AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
  isDanger?: boolean
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  onConfirm,
  onClose,
  isDanger = true
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10 transform scale-100 opacity-100 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm ${
              isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20 hover:shadow-red-600/40' : 'bg-primary hover:bg-primary-600 shadow-primary/20 hover:shadow-primary/40'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
