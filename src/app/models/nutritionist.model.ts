export interface NutritionistRequestDTO {
    fullName?: string;
    phone?: string;
    birthDate?: string;
    photo?: string;
    specialties?: string;
    consultationFee?: number;
    consultationMode?: string;
}

export interface NutritionistResponseDTO {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    birthDate?: string;
    photo?: string;
    licenseNumber?: string;
    specialties?: string;
    consultationFee?: number;
    consultationMode?: string;
}
