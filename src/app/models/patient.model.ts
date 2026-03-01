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
}
