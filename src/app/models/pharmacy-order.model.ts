export interface PharmacyOrderItemDTO {
  productId: number;
  quantity: number;
  price?: number;
}

export interface PharmacyOrderRequestDTO {
  patientId: number;
  pharmacyId: number;
  deliveryAddress: string;
  scheduledDeliveryDate?: string;
  items: PharmacyOrderItemDTO[];
  prescriptionImageUrl?: string;
  deliveryType: 'PICKUP' | 'HOME_DELIVERY';
}

export interface PharmacyOrderResponseDTO {
  id: number;
  patientId: number;
  patientName: string;
  pharmacyId: number;
  pharmacyName: string;
  prescriptionId?: number;
  status: OrderStatus;
  totalPrice: number;
  deliveryAddress: string;
  scheduledDeliveryDate?: string;
  deliveryType?: string;
  pharmacistNote?: string;
  createdAt: string;
  updatedAt: string;
  prescriptionImageUrl?: string;
  items: OrderItemDTO[];
  trackingHistory: OrderTrackingDTO[];
}

export interface OrderItemDTO {
  productId: number;
  productName?: string;
  quantity: number;
  price: number;
}

export interface OrderTrackingDTO {
  status: OrderStatus;
  note?: string;
  changedBy?: string;
  changedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'VALIDATED'
  | 'AWAITING_CHOICE'
  | 'RESERVED'
  | 'DELIVERY_REQUESTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_VALIDATED'
  | 'DELIVERY_CHOICE_REQUIRED'
  | 'PAYMENT_CONFIRMED'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'ORDER_CANCELLED'
  | 'ORDER_REJECTED'
  | 'NO_DRIVER_AVAILABLE';

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  note?: string;
  changedBy?: string;
  deliveryType?: 'DELIVERY' | 'PICKUP';
}

export interface CancelOrderDTO {
  reason: string;
}

export interface RejectOrderDTO {
  note: string;
  changedBy?: string;
}

export interface PharmacyStatsDTO {
  pharmacyId: number;
  pharmacyName: string;
  totalOrders: number;
  pendingOrders: number;
  validatedOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  topProducts: TopProductDTO[];
}

export interface TopProductDTO {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}
