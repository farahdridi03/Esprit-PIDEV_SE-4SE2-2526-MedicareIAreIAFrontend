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
}
