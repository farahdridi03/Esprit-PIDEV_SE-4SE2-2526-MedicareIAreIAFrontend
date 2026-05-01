export interface EligibilityResult {
    eligible:       boolean;
    probability:    number;
    decision:       'ELIGIBLE' | 'NOT_ELIGIBLE' | 'ERROR';
    confidence:     'HIGH' | 'MEDIUM' | 'LOW';
    details:        EligibilityDetails;
    aidRequestId?:  number;
    patientName?:   string;
}

export interface EligibilityDetails {
    revenus_mensuels_tnd:  number;
    personnes_a_charge:    number;
    chronic_score:         number;
    diagnosis_score:       number;
    est_tres_pauvre:       boolean;
    charge_medicale_haute: boolean;
    besoin_global:         number;
}
