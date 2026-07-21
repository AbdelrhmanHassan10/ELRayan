// ─── Shared ───────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Real API response shape for products
export interface ProductsResponse {
  items: Product[]
  metadata: {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
  links?: {
    hasNext: boolean
    next?: string
    last?: string
  }
}

// Generic paginated (used by orders, notifications, etc.)
export interface PaginatedData<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ─── User / Auth ───────────────────────────────────────────────────────────────
export interface User {
  id: number
  email: string
  fullName: string
  gender?: 'male' | 'female'
  phoneNumber?: string
  isEmailVerified: boolean
  role: 'user' | 'admin'
  lastLoginAt?: string
  playerIds?: string[]
  addresses?: Address[]
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  identifier: string
  password: string
  playerId: string
}

export interface SignUpPayload {
  email: string
  fullName: string
  phoneNumber?: string
  password: string
  playerId: string
}

export interface VerifyOtpPayload {
  email: string
  otpCode: string
}

export interface ResendOtpPayload {
  email: string
  forgetPassword?: boolean
}

export interface ForgetPasswordPayload {
  email: string
}

export interface UpdatePasswordPayload {
  email: string
  otpAgin: string
  newPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface EditProfilePayload {
  fullName?: string
  phoneNumber?: string
  gender?: 'male' | 'female'
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

// ─── Category / SubCategory ────────────────────────────────────────────────────
export interface Category {
  id: number
  icon?: string
  name: Record<string, string>
  subCategories?: SubCategory[]
  createdAt: string
  updatedAt: string
}

export interface SubCategory {
  id: number
  icon?: string
  name: Record<string, string>
  main_category_id: number
  mainCategory?: Category
  createdAt: string
  updatedAt: string
}

// ─── Product ───────────────────────────────────────────────────────────────────
export interface Attachment {
  id: number
  attach: string
}

export interface Product {
  id: number
  name: Record<string, string>
  description?: Record<string, string>
  details?: Record<string, string>
  price: number
  supplier_price?: number
  stock: number
  sold: number
  isRecommended: boolean
  isFeatured: boolean
  isHidden: boolean
  discount: number
  discount_type: 'percentage' | 'fixed'
  unit?: string
  main_category_id: number
  sub_category_id: number
  mainCategory?: Category
  subCategory?: SubCategory
  images: Attachment[]
  isFavorite?: boolean
  priceAfterDiscount?: number
  createdAt: string
  updatedAt: string
}

// ─── Cart ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number
  productId: number
  productName: string
  description: string
  productImages: string[]
  quantity: number
  unitPrice: number
  totalPrice: number
  totalPriceWithDiscount: number
  inStock: boolean
  discount: number
  discountType: 'percentage' | 'fixed'
}

export interface Cart {
  id: number
  items: CartItem[]
  itemsCount: number
  subtotal: number
  subtotalWithDiscount: number
  discountAmount: number
  shippingAmount: number
  total: number
  coupon?: Coupon | null
}

// ─── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'cash_on_delivery' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface OrderItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
  productName: string
  productImages: string[]
  product?: Product
}

export interface Order {
  id: number
  userId: number
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  subtotal: number
  discountAmount: number
  shippingAmount: number
  totalAmount: number
  coupon?: Coupon | null
  shippingPhone1: string
  shippingPhone2?: string
  shippingTitle?: string
  shippingDescription?: string
  shippingLatitude?: number
  shippingLongitude?: number
  notes?: string
  shippedAt?: string
  deliveredAt?: string
  orderItems: OrderItem[]
  user?: User
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  shippingAddress: { phone1: string; phone2?: string }
  paymentMethod: PaymentMethod
  notes?: string
}

// ─── Address ───────────────────────────────────────────────────────────────────
export type AddressType = 'home' | 'work' | 'other'

export interface Address {
  id: number
  type: AddressType
  title?: string
  description?: string
  latitude?: number
  longitude?: number
  isDefault: boolean
  zone?: Zone
  createdAt: string
  updatedAt: string
}

export interface CreateAddressPayload {
  type: AddressType
  title?: string
  description?: string
  latitude?: number
  longitude?: number
  zoneId?: number
}

// ─── Zone ──────────────────────────────────────────────────────────────────────
export interface Zone {
  id: number
  name: string
  polygon: unknown
  isActive: boolean
  shippingCost: number
}

// ─── Coupon ────────────────────────────────────────────────────────────────────
export interface Coupon {
  id: number
  code: string
  name?: Record<string, string>
  description?: Record<string, string>
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  status: 'active' | 'inactive' | 'expired'
  validFrom: string
  validTo: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Reward (Spin Wheel) ───────────────────────────────────────────────────────
export type RewardType = 'discount' | 'free_product' | 'coupon' | 'no_reward'

export interface Reward {
  id: number
  type: RewardType
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  productId?: number
  displayText: string
  couponCode?: string
  probability: number
  isActive: boolean
  description?: string
  expiresAt?: string
  minOrderAmount?: number
}

export interface SpinResult {
  reward: Reward
  coupon?: Coupon
  message: string
}

// ─── Review ────────────────────────────────────────────────────────────────────
export interface Review {
  id: number
  rating: number
  comment?: string
  userId: number
  orderId?: number
  user?: User
  createdAt: string
  updatedAt: string
}

export interface CreateReviewPayload {
  rating: number
  comment?: string
  orderId?: number
}

export interface ReviewStats {
  average: number
  total: number
  distribution: Record<string, number>
}

// ─── Banner ────────────────────────────────────────────────────────────────────
export interface Banner {
  id: number
  title: string
  description?: string
  imagePath?: string
  link?: string
  type: 'new' | 'sale' | 'featured'
  productId?: number
  product?: Product
}

// ─── Notification ──────────────────────────────────────────────────────────────
export interface Notification {
  id: number
  title: string
  body: string
  isRead: boolean
  userId: number
  createdAt: string
  updatedAt: string
}

// ─── Complaint / Suggestion ────────────────────────────────────────────────────
export interface ComplaintSuggestion {
  id: number
  title: string
  type: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  attachment?: string
  userId: number
  user?: User
  createdAt: string
  updatedAt: string
}

export interface CreateComplaintPayload {
  title: string
  type: string
  description: string
  attachment?: string
}
