export interface AddressItem {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethodItem {
  id: string;
  type: "card" | "mobile_banking" | "cash_on_delivery";
  brand?: string;
  last4?: string;
  holderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  provider?: string;
  isDefault: boolean;
}

export interface OrderItemLine {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  slug?: string;
  image?: string;
}

export interface Order {
  id: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  paymentMethod: string;
  createdAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  returnRequestedAt?: string;
  items?: OrderItemLine[];
  shippingAddress?: AddressItem | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image?: string;
}

export interface ReviewItem {
  id: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  productName?: string;
  productSlug?: string;
  productImage?: string;
}

export interface RecentlyViewedItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  image?: string;
}
