export interface Consultation {
  id?: number;
  medicalRecordId: number;
  doctorId: number;
  date: string;
  observations: string;
  notes: string;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
}

export interface Treatment {
  id?: number;
  consultationId: number;
  treatmentType: string;
  description: string;
  startDate: string;
  endDate?: string;
  status: string;
}

export interface PrescriptionItem {
  id?: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id?: number;
  consultationId: number;
  date: string;
  items: PrescriptionItem[];
}

export interface Diagnosis {
  id?: number;
  consultationId: number;
  description: string;
  type: string;
}
