
export interface LaboratoryRequest {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  specializations?: string;
  isActive?: boolean;
}

export type LaboratoryResponseDTO = LaboratoryResponse;

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

