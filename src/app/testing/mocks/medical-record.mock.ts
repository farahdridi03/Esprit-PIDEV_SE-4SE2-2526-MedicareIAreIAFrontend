import { PatientResponseDTO } from '../../models/patient.model';

export const MOCK_PATIENT_ME: PatientResponseDTO = {
    id: 101,
    fullName: 'John Doe',
    email: 'test@example.com',
    role: 'PATIENT',
    enabled: true,
    phone: '12345678',
    birthDate: '1990-01-01',
    gender: 'MALE',
    bloodType: 'O+',
    consultations: [
        { id: 1, date: '2026-03-01', doctorName: 'Dr. Smith', specialty: 'General', status: 'COMPLETED' },
        { id: 2, date: '2026-03-15', doctorName: 'Dr. Jones', specialty: 'Cardiology', status: 'PENDING' }
    ],
    treatments: [
        { id: 1, treatmentType: 'Antibiotics', startDate: '2026-03-01', endDate: '2026-03-10', dosage: '500mg', status: 'COMPLETED' }
    ],
    prescriptions: [
        { id: 1, date: '2026-03-01', medication: 'Amoxicillin', instructions: 'Take with food', dosage: '500mg' }
    ],
    diagnoses: [
        { id: 1, description: 'Influenza', type: 'Viral' }
    ]
};

export const MOCK_MEDICAL_RECORDS = [
    { id: 1, patientId: 101 }
];
