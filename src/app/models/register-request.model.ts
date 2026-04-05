export interface MedicalHistory {
    type: 'ALLERGY' | 'CHRONIC_DISEASE' | 'SURGERY' | 'FAMILY_HISTORY';
    description: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    birthDate?: Date | string;
    gender?: string;
    bloodType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalHistories?: MedicalHistory[];
    specialty?: string;
    licenseNumber?: string;
    consultationFee?: number;
    consultationMode?: 'ONLINE' | 'IN_PERSON' | 'BOTH';

    // Clinic fields
    clinicName?: string;
    clinicAddress?: string;
    clinicPhone?: string;
    emergencyPhone?: string;
    ambulancePhone?: string;

    // Pharmacist fields
    pharmacyName?: string;
    pharmacyAddress?: string;
    pharmacyPhone?: string;
    pharmacyEmail?: string;

    // Laboratory fields
    labName?: string;
    labAddress?: string;
    labPhone?: string;

    // Home Care Provider fields
    certificationDocument?: string;
    homeCareServices?: string[];
    
    // Patient physical metrics
    height?: number;
    weight?: number;
    allergies?: string;
    diseases?: string;
}
