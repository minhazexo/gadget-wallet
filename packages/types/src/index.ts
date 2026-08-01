export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  phone?: string;
  avatar?: string;
  role: "user" | "admin";
  isActive: boolean;
  tokenVersion: number;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  sku: string;
  brandId: string;
  categoryId: string;
  stock: number;
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  order: number;
}

export interface ProductSpec {
  id: string;
  productId: string;
  key: string;
  value: string;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  paymentMethod: string;
  shippingAddressId: string;
  couponId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  returnRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface HeroMedia {
  id: string;
  videoUrl: string;
  posterUrl?: string;
  headline: string;
  subheadline: string;
  isActive: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
  createdAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "mobile_banking" | "cash_on_delivery";
  brand?: string;
  last4?: string;
  holderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  provider?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  orderUpdates: boolean;
  promotional: boolean;
  sms: boolean;
  push: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentlyViewed {
  id: string;
  userId: string;
  productId: string;
  viewedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
