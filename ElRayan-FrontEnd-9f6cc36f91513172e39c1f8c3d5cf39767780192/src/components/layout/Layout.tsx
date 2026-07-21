import Navbar from './Navbar'
import Footer from './Footer'
import { CartProvider } from '../../contexts/CartContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
