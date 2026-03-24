export interface LaboratoryRequest {
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  specializations?: string;
  isActive?: boolean;  // ✅ ajouté
}

export interface LaboratoryResponse {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  specializations: string;
  isActive: boolean;
  createdAt: string;
}