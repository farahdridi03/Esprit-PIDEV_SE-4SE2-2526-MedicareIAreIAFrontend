export interface DoctorDetail {
  id: number;
  fullName: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
  consultationMode: 'ONLINE' | 'IN_PERSON' | 'BOTH';
  clinicAddress: string;
  clinicId: number;
  clinicName: string;
  isProfileComplete: boolean;
  bio?: string;
  patientCount?: number;
  rating?: number;
}
