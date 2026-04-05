import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MedicalRecordComponent } from './medical-record.component';
import { PatientService } from '../../../../../services/patient.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { MOCK_PATIENT_ME } from '../../../../../testing/mocks/medical-record.mock';

describe('MedicalRecordComponent', () => {
    let component: MedicalRecordComponent;
    let fixture: ComponentFixture<MedicalRecordComponent>;
    let patientServiceSpy: jasmine.SpyObj<PatientService>;

    beforeEach(async () => {
        const patientSpy = jasmine.createSpyObj('PatientService', ['getMe']);
        const authSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
        const userSpy = jasmine.createSpyObj('UserService', ['getUser']);

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [MedicalRecordComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PatientService, useValue: patientSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: UserService, useValue: userSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MedicalRecordComponent);
        component = fixture.componentInstance;
        patientServiceSpy = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load data on init', () => {
        patientServiceSpy.getMe.and.returnValue(of(MOCK_PATIENT_ME as any));
        fixture.detectChanges(); // calls ngOnInit()
        expect(patientServiceSpy.getMe).toHaveBeenCalled();
        expect(component.patient?.id).toBe(101);
    });

    it('should sort data by date correctly', () => {
        const unsortedData = {
            ...MOCK_PATIENT_ME,
            consultations: [
                { id: 1, date: '2026-03-01' },
                { id: 2, date: '2026-03-15' },
                { id: 3, date: '2026-01-01' }
            ]
        };
        patientServiceSpy.getMe.and.returnValue(of(unsortedData as any));
        component.loadPatientData();
        
        expect(component.consultations[0].id).toBe(2); // Newest first
        expect(component.consultations[2].id).toBe(3); // Oldest last
    });

    it('should return recent slices correctly', () => {
        component.consultations = [
            { id: 1 } as any, { id: 2 } as any, { id: 3 } as any, 
            { id: 4 } as any, { id: 5 } as any, { id: 6 } as any
        ];
        expect(component.recentConsultations.length).toBe(5);
        expect(component.recentConsultations[0].id).toBe(1);
    });

    it('should trigger download on downloadPrescription', () => {
        const mockPrescription = {
            id: 1,
            date: '2026-03-01',
            medication: 'Aspirin',
            instructions: 'Daily',
            dosage: '100mg'
        };
        
        const createObjectURLSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
        const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL');
        
        component.downloadPrescription(mockPrescription);
        
        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
});
