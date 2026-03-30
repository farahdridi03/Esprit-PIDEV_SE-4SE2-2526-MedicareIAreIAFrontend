import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabResultFormComponent } from './lab-result-form.component';
import { LabResultService } from '../../../../../services/lab-result.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LabResultFormComponent', () => {
  let component: LabResultFormComponent;
  let fixture: ComponentFixture<LabResultFormComponent>;
  let mockLabResultService: jasmine.SpyObj<LabResultService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    mockLabResultService = jasmine.createSpyObj('LabResultService', ['create', 'update']);

    await TestBed.configureTestingModule({
      declarations: [ LabResultFormComponent ],
      imports: [ HttpClientTestingModule, FormsModule ],
      providers: [
        { provide: LabResultService, useValue: mockLabResultService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LabResultFormComponent);
    component = fixture.componentInstance;
    
    // Mock localStorage for token
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    
    fixture.detectChanges();

    // Handle initial HTTP requests from ngOnInit
    const req = httpMock.expectOne('http://localhost:8081/springsecurity/api/lab-requests/status/PENDING');
    req.flush([{ id: 1, testType: 'Blood Test' }]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load pending requests', () => {
    expect(component).toBeTruthy();
    expect(component.pendingRequests.length).toBe(1);
    expect(component.pendingRequests[0].id).toBe(1);
  });

  it('should initialize form with editResult if provided', () => {
    component.editResult = { id: 1, labRequestId: 2, resultData: 'Test', technicianName: 'John', status: 'COMPLETED' } as any;
    component.ngOnInit();
    
    // Catch pending request from the second ngOnInit call
    const req = httpMock.expectOne('http://localhost:8081/springsecurity/api/lab-requests/status/PENDING');
    req.flush([]);

    expect(component.form.resultData).toBe('Test');
    expect(component.form.technicianName).toBe('John');
    expect(component.isEditMode).toBeTrue();
  });

  it('should validate technician name', () => {
    component.form.technicianName = 'Jo';
    expect(component.isValidTechnicianName()).toBeFalse();

    component.form.technicianName = 'John Doe';
    expect(component.isValidTechnicianName()).toBeTrue();

    component.form.technicianName = 'John123';
    expect(component.isValidTechnicianName()).toBeFalse();
  });

  it('should not submit if required fields are missing', () => {
    component.form.labRequestId = null;
    component.onSubmit();
    expect(component.errorMessage).toBe('Please fill all required fields.');
    expect(mockLabResultService.create).not.toHaveBeenCalled();
  });

  it('should create a new lab result successfully', () => {
    component.form = {
      labRequestId: 1,
      resultData: 'Normal',
      technicianName: 'Jane Smith',
      verifiedBy: '',
      isAbnormal: false,
      abnormalFindings: '',
      status: 'COMPLETED'
    };

    mockLabResultService.create.and.returnValue(of({} as any));
    spyOn(component.saved, 'emit');

    component.onSubmit();

    expect(mockLabResultService.create).toHaveBeenCalled();
    expect(component.saved.emit).toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  });

  it('should update an existing lab result', () => {
    component.editResult = { id: 5 } as any; // Set edit mode
    component.form = {
      labRequestId: 1,
      resultData: 'Normal',
      technicianName: 'Jane Smith',
      verifiedBy: '',
      isAbnormal: false,
      abnormalFindings: '',
      status: 'COMPLETED'
    };

    mockLabResultService.update.and.returnValue(of({} as any));
    spyOn(component.saved, 'emit');

    component.onSubmit();

    expect(mockLabResultService.update).toHaveBeenCalledWith(5, jasmine.any(Object));
    expect(component.saved.emit).toHaveBeenCalled();
  });

  it('should handle submission error', () => {
    component.form = {
      labRequestId: 1,
      resultData: 'Normal',
      technicianName: 'Jane Smith',
      verifiedBy: '',
      isAbnormal: false,
      abnormalFindings: '',
      status: 'COMPLETED'
    };

    mockLabResultService.create.and.returnValue(throwError(() => new Error('Creation failed')));

    component.onSubmit();

    expect(component.errorMessage).toBe('Error saving. Please try again.');
    expect(component.isSubmitting).toBeFalse();
  });
});
