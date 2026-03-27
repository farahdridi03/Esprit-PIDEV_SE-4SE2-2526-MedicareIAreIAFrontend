export interface PatientRequestDTO {
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
    birthDate?: string;
    role?: string;
    gender?: string;
    bloodType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    glucoseRate?: number | string;
    height?: number;
    weight?: number;
    allergies?: string[];
    diseases?: string[];
    consultations?: any[];
    treatments?: any[];
    prescriptions?: any[];
    photo?: string;
}

export interface PatientResponseDTO {
    id: number;
    fullName: string;
    email: string;
    role: string;
    enabled: boolean;
    phone?: string;
    birthDate?: string;
    gender?: string;
    bloodType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    glucoseRate?: number | string;
    height?: number;
    weight?: number;
    hasMedicalRecord?: boolean;
    allergies?: string[];
    diseases?: string[];
    consultations?: any[];
    treatments?: any[];
    prescriptions?: any[];
    diagnoses?: any[];
    lifestyleGoals?: any[];
    lifestylePlans?: any[];
    progressTrackings?: any[];
    photo?: string;
}
