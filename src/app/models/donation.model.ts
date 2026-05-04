export enum DonationType {
    MATERIEL = 'MATERIEL',
    MONEY = 'MONEY',
    MEDICAMENT = 'MEDICAMENT'
}

export enum DonationStatus {
    AVAILABLE = 'AVAILABLE',
    ASSIGNED = 'ASSIGNED'
}

export interface Donation {
    id?: number;
    creatorId?: number;
    type: DonationType;
    donorName: string;
    donorProfileImage?: string;
    status: DonationStatus;
    amount?: number;
    categorie?: string;
    description?: string;
    quantite?: number;
    imageData?: string; // base64 representation from backend OR loaded via browser
    imageContentType?: string;
    createdAt?: string;
}

export enum AidRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum AidRequestType {
    MONEY = 'MONEY',
    MATERIEL = 'MATERIEL',
    MEDICAMENT = 'MEDICAMENT'
}

export interface AidRequest {
    id?: number;
    patientId: number;
    patientName?: string;
    type?: AidRequestType;
    description: string;
    supportingDocument?: string;
    status?: AidRequestStatus;
    createdAt?: string;
    // Données AI éligibilité
    chronicDiseases?: string;
    hereditaryDiseases?: number;
    drugAllergies?: number;
    diagnosisType?: string;
    nbDiagnoses?: number;
    nbPrescriptions?: number;
    revenusMenuelsTnd?: number;
    personnesACharge?: number;
    situationProfessionnelle?: string;
    scorePrecarite?: number;
}

export interface DonationAssignment {
    id?: number;
    donationId: number;
    aidRequestId: number;
    patientName?: string;
    assignedAt?: string;
}
