export enum NotificationType {
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_VALIDATED = 'ORDER_VALIDATED',
    DELIVERY_CHOICE_REQUIRED = 'DELIVERY_CHOICE_REQUIRED',
    PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
    DELIVERY_ASSIGNED = 'DELIVERY_ASSIGNED',
    DELIVERY_PICKED_UP = 'DELIVERY_PICKED_UP',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERERD = 'DELIVERED',
    ORDER_CANCELLED = 'ORDER_CANCELLED',
    ORDER_REJECTED = 'ORDER_REJECTED',
    NO_DRIVER_AVAILABLE = 'NO_DRIVER_AVAILABLE',
    REG_REQ = 'REG_REQ',
    ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED',
    NEW_HOMECARE_REQUEST = 'NEW_HOMECARE_REQUEST'
}

export interface NotificationResponseDTO {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    orderId?: number;
}
