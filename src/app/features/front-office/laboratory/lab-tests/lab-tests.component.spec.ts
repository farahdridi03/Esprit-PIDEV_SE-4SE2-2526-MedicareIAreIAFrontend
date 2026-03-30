import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTestsComponent } from './lab-tests.component';
import { AuthService } from '../../../../services/auth.service';
import { LabTestService } from '../../../../services/lab-test.service';
import { LabRequestService } from '../../../../services/lab-request.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('LabTestsComponent', () => {
  let component: LabTestsComponent;
  let fixture: ComponentFixture<LabTestsComponent>;
  let mockLabTestService: jasmine.SpyObj<LabTestService>;
  let mockLabRequestService: jasmine.SpyObj<LabRequestService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockLabTestService = jasmine.createSpyObj('LabTestService', ['getAll', 'delete']);
    mockLabRequestService = jasmine.createSpyObj('LabRequestService', ['getAllPending']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['']); // Add mock methods if necessary

    mockLabTestService.getAll.and.returnValue(of([]));
    mockLabRequestService.getAllPending.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ LabTestsComponent ],
      imports: [ HttpClientTestingModule, FormsModule ],
      providers: [
        { provide: LabTestService, useValue: mockLabTestService },
        { provide: LabRequestService, useValue: mockLabRequestService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load lab tests on init', () => {
    expect(mockLabTestService.getAll).toHaveBeenCalled();
    expect(mockLabRequestService.getAllPending).toHaveBeenCalled();
  });

  it('should compute stats correctly', () => {
    component.tests = [
      { id: 1, name: 'Test 1', testType: 'BLOOD_TEST', description: '', minReferenceRange: 0, maxReferenceRange: 10, patientId: 1, laboratoryId: 1 } as any,
      { id: 2, name: 'Test 2', testType: 'IMAGING', description: '', minReferenceRange: 0, maxReferenceRange: 10, patientId: 1, laboratoryId: 1 } as any,
      { id: 3, name: 'Test 3', testType: 'OTHER', description: '', minReferenceRange: 0, maxReferenceRange: 10, patientId: 1, laboratoryId: 1 } as any,
      { id: 4, name: 'Test 4', testType: 'BLOOD_TEST', description: '', minReferenceRange: 0, maxReferenceRange: 10, patientId: 1, laboratoryId: 1 } as any
    ];
    
    component.computeStats();
    
    expect(component.stats.total).toBe(4);
    expect(component.stats.blood).toBe(2);
    expect(component.stats.imaging).toBe(1);
    expect(component.stats.other).toBe(1);
  });

  it('should set showForm to true when openCreate is called', () => {
    component.openCreate();
    expect(component.showForm).toBeTrue();
    expect(component.editTest).toBeNull();
    expect(component.selectedRequest).toBeNull();
  });
  
  it('should properly apply search filters', () => {
    component.tests = [
      { id: 1, name: 'Hemoglobin', testType: 'BLOOD_TEST', description: '', minReferenceRange: 0, maxReferenceRange: 10, patientId: 1, laboratoryId: 1 } as any,
      { id: 2, name: 'X-Ray', testType: 'IMAGING', description: '', minReferenceRange: 0, maxReferenceRange: 10, patientId: 1, laboratoryId: 1 } as any
    ];
    component.searchQuery = 'Hemo';
    component.onSearchChange();
    expect(component.filteredTests.length).toBe(1);
    expect(component.filteredTests[0].name).toBe('Hemoglobin');
  });
});
