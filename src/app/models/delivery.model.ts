export enum DeliveryStatus {
    PENDING = 'PENDING',
    REQUESTED = 'REQUESTED',
    ASSIGNED = 'ASSIGNED',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
    RETURNED = 'RETURNED'
}

export interface Delivery {
    id: number;
    orderId?: number; // Optional as we might use object
    order?: any;    // For compatibility with some backend responses
    status: DeliveryStatus;
    trackingNumber: string;
    courierName: string;
    courierPhone?: string;
    estimatedDeliveryDate: string;
    createdAt: string;
    updatedAt: string;
}
