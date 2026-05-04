import { Product } from './product.model';
import { Pharmacy } from './pharmacy.model';

export interface ReceiveBatchRequest {
  pharmacyId: number;
  productId: number;
  batchNumber: string;
  quantity: number;
  expirationDate: string;
  purchasePrice: number;
  sellingPrice: number;
  minQuantityThreshold: number;
}

export interface StockMovementRequest {
  pharmacyStockId: number;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';
  quantity: number;
  reference: string;
}

export interface Batch {
  id: number;
  batchNumber: string;
  quantity: number;
  expirationDate: string;
  purchasePrice: number;
  sellingPrice: number;
  receivedAt: string;
}

export interface PharmacyStock {
  id: number;
  totalQuantity: number;
  minQuantityThreshold: number;
  product: Product;
  pharmacy: Pharmacy;
}

export interface StockMovement {
  id: number;
  movementType: string;
  quantity: number;
  reference: string;
  createdAt: string;
}

export interface StockAlert {
  id: number;
  alertType: string;
  message: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface ExpirationRisk {
  batchId: number;
  productName: string;
  batchNumber: string;
  quantity: number;
  expirationDate: string;
  daysUntilExpiration: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'EXPIRED' | 'GREEN' | 'RED' | 'ORANGE' | string;
  recommendedAction?: string;
}

export interface ReplenishmentPrediction {
  stockId: number;
  productId?: number;
  productName: string;
  currentQuantity: number;
  currentStock?: number;
  predictedDemand: number;
  suggestedOrderQuantity: number;
  confidenceScore: number;
  reasoning: string;
  activeAlerts?: number;
  consumptionLast30Days?: number;
  isSeasonal?: boolean;
  estimatedDepletionDate?: string;
}
