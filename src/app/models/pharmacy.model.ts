export interface PharmacyRequest {
  name: string;
  address: string;
  locationLat: number;
  locationLng: number;
  phoneNumber: string;
  email: string;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  locationLat: number;
  locationLng: number;
  phoneNumber: string;
  email: string;
  createdAt?: string;
}
