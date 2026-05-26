export enum PaymentMethod {
    STRIPE = 'STRIPE',
    D17 = 'D17',
    BANK_CARD = 'BANK_CARD',
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

export interface PaymentRequestDTO {
    orderId: number;
    method: PaymentMethod;
    paymentToken?: string;
}

export interface PaymentResponseDTO {
    id: number;
    orderId: number;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    transactionId?: string;
    currency: string;
    createdAt: string;
    paidAt?: string;
    confirmedAt?: string;
    gatewayMetadata?: string;
    clientSecret?: string;
}
