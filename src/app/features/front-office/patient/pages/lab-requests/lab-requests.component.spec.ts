import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LabRequestsComponent } from './lab-requests.component';
import { LabRequestService } from './lab-request.service';
import { AuthService } from '../../../../../services/auth.service';

describe('LabRequestsComponent', () => {
  let component: LabRequestsComponent;
  let fixture: ComponentFixture<LabRequestsComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLabService: jasmine.SpyObj<LabRequestService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getPatientId', 'isAuthenticated', 'getToken']);
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const labServiceSpy = jasmine.createSpyObj('LabRequestService', ['getByPatient', 'getLaboratories']);

    await TestBed.configureTestingModule({
      declarations: [ LabRequestsComponent ],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: LabRequestService, useValue: labServiceSpy }
      ]
    }).compileComponents();

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockLabService = TestBed.inject(LabRequestService) as jasmine.SpyObj<LabRequestService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabRequestsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle invalid patient ID (0)', () => {
    mockAuthService.getPatientId.and.returnValue(0);
    fixture.detectChanges();
    
    expect(component.patientId).toBe(0);
    expect(component.submitError).toContain('Invalid patient ID');
  });

  it('should handle invalid patient ID (negative)', () => {
    mockAuthService.getPatientId.and.returnValue(-1);
    fixture.detectChanges();
    
    expect(component.patientId).toBe(-1);
    expect(component.submitError).toContain('Invalid patient ID');
  });

  it('should load requests when patient ID is valid', () => {
    mockAuthService.getPatientId.and.returnValue(1);
    const mockRequests = [
      {
        id: 1,
        patientId: 1,
        patientName: 'John Doe',
        laboratoryId: 1,
        laboratoryName: 'Test Lab',
        testType: 'Blood Test',
        status: 'PENDING',
        scheduledAt: '2024-01-01T10:00:00',
        clinicalNotes: 'Test notes',
        requestedBy: 'PATIENT'
      }
    ];
    
    mockLabService.getByPatient.and.returnValue(of(mockRequests));

    fixture.detectChanges();
    
    expect(component.patientId).toBe(1);
    expect(component.requests).toEqual(mockRequests);
    expect(component.isLoading).toBe(false);
  });

  it('should handle load requests error', () => {
    mockAuthService.getPatientId.and.returnValue(1);
    mockLabService.getByPatient.and.returnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();
    
    expect(component.submitError).toContain('Failed to load lab requests');
    expect(component.isLoading).toBe(false);
  });

  it('should not submit form with invalid patient ID', () => {
    mockAuthService.getPatientId.and.returnValue(0);
    fixture.detectChanges();
    component.form.setValue({
      laboratoryId: 1,
      testType: 'Blood Test',
      scheduledAt: '2024-01-01T10:00',
      clinicalNotes: ''
    });
    
    component.onSubmit();
    
    expect(component.submitError).toContain('Session expired');
    expect(component.isSubmitting).toBe(false);
  });
});
