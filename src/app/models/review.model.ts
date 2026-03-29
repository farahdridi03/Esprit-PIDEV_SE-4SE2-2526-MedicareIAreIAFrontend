export interface Review {
  id: number;
  doctorId: number;
  patientName: string;
  patientId: number;
  rating: number;
  comment: string;
  createdAt: string;
  isAnonymous: boolean;
}
