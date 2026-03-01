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
    chronicDiseases?: string;
    drugAllergies?: string;
    hereditaryDiseases?: string;
}
