export enum ProductType {
  MEDICATION = 'MEDICATION',
  PARAPHARMA = 'PARAPHARMA',
  DEVICE = 'DEVICE',
  SUPPLEMENT = 'SUPPLEMENT',
  HYGIENE = 'HYGIENE',
  OTHER = 'OTHER'
}

export enum ProductUnit {
  PIECE = 'PIECE',
  BOX = 'BOX',
  BOTTLE = 'BOTTLE',
  TUBE = 'TUBE',
  ML = 'ML',
  G = 'G'
}

export interface ProductRequest {
  name: string;
  description: string;
  imageUrl: string;
  manufacturer: string;
  brand: string;
  category: string;
  type: ProductType;
  barcode: string;
  unit: ProductUnit;
}

export interface Product extends ProductRequest {
  id: number;
  createdAt?: string;
}
