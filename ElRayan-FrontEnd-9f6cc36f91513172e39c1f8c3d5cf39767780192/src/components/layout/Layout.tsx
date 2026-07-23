import Navbar from './Navbar'
import Footer from './Footer'
import { CartProvider } from '../../contexts/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {children}
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </CartProvider>
  )
}
