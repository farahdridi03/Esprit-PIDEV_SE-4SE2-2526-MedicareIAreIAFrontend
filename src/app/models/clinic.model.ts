export interface ClinicResponseDTO {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    birthDate: string;
    photo?: string;
    clinicName: string;
    address: string;
    latitude?: number;
    longitude?: number;
    hasEmergency: boolean;
    hasAmbulance: boolean;
    emergencyPhone?: string;
    ambulancePhone?: string;
}

export interface ClinicUpdateRequestDTO {
    fullName?: string;
    phone?: string;
    birthDate?: string;
    photo?: string;
    clinicName?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    hasEmergency?: boolean;
    hasAmbulance?: boolean;
    emergencyPhone?: string;
    ambulancePhone?: string;
}
