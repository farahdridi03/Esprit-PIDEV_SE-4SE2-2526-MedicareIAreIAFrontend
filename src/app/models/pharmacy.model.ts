export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  locationLat?: number;
  locationLng?: number;
  phoneNumber?: string;
  email?: string;
}

export interface PharmacyResponseDTO {
  id: number;
  name: string;
  address: string;
  locationLat?: number;
  locationLng?: number;
  phoneNumber?: string;
  email?: string;
}

export interface PharmacyStockResponseDTO {
  id: number;
  pharmacyId: number;
  pharmacyName: string;
  productId: number;
  productName: string;
  totalQuantity: number;
  minQuantityThreshold: number;
  unitPrice: number;
  stockStatus: 'OK' | 'LOW';
}

export interface ProductResponseDTO {
  id: number;
  name: string;
  description?: string;
  productType?: string;
  productUnit?: string;
}

export interface DeliveryResponseDTO {
  id: number;
  orderId: number;
  agencyName?: string;
  externalTrackingId?: string;
  trackingUrl?: string;
  status: string;
  currentLat?: number;
  currentLng?: number;
  estimatedArrival?: string;
  requestedAt?: string;
  deliveredAt?: string;
}

export interface DeliveryAgency {
  id: number;
  name: string;
  logoUrl?: string;
  phoneNumber?: string;
  city?: string;
}

export interface DeliveryAgent {
  id: number;
  name: string;
  phoneNumber?: string;
  vehicleType?: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  agency?: DeliveryAgency;
}

export interface PharmacyRequest {
  name: string;
  address: string;
  locationLat?: number;
  locationLng?: number;
  phoneNumber?: string;
  email?: string;
}
