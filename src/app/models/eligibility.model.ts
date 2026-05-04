export interface EligibilityResult {
    eligible:               boolean;
    probability:            number;
    decision:               'ELIGIBLE' | 'NOT_ELIGIBLE' | 'ERROR';
    confidence:             'HIGH' | 'MEDIUM' | 'LOW';
    details:                EligibilityDetails;
    aidRequestId?:          number;
    patientName?:           string;
    requestType?:           string;   // 'MONEY' | 'MATERIEL' | 'MEDICAMENT'
    medicineAvailability?:  { [medicineName: string]: boolean };
}

// General model (MONEY / MATERIEL)
export interface EligibilityDetails {
    // Financial / medical factors
    revenus_mensuels_tnd?:  number;
    personnes_a_charge?:    number;
    chronic_score?:         number;
    diagnosis_score?:       number;
    est_tres_pauvre?:       boolean;
    charge_medicale_haute?: boolean;
    besoin_global?:         number;

    // Prescription / OCR factors (MEDICAMENT)
    medicines_detected?:    MedicineDetected[];
    nb_medicaments?:        number;
    has_chronic_med?:       boolean;
    has_antibiotic?:        boolean;
    dose_max_mg?:           number;
    freq_totale_jour?:      number;
    image_quality_score?:   number;
    blur?:                  boolean;
    rejection_reason?:      string;
    image_quality?:         ImageQuality;
    ocr_texts?:             string[];
}

export interface MedicineDetected {
    name:      string;
    dosage_mg: number;
    dosage:    string;
    frequency: string;
}

export interface ImageQuality {
    blur:                boolean | number;
    blur_score?:         number;
    abs_rotation:        number;
    brightness:          number;
    image_quality_score: number;
}
