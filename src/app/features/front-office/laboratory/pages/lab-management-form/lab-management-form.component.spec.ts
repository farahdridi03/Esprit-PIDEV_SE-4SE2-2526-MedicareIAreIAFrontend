import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LabManagementFormComponent } from './lab-management-form.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LaboratoryService } from '../../../../../services/laboratory.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LabManagementFormComponent', () => {
  let component: LabManagementFormComponent;
  let fixture: ComponentFixture<LabManagementFormComponent>;
  let mockLaboratoryService: jasmine.SpyObj<LaboratoryService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockLaboratoryService = jasmine.createSpyObj('LaboratoryService', ['getById', 'create', 'update']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ LabManagementFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: LaboratoryService, useValue: mockLaboratoryService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabManagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.valid).toBeFalsy();
    expect(component.form.controls['name'].value).toBe('');
    expect(component.form.controls['isActive'].value).toBe(true);
  });

  it('should load laboratory data in edit mode', () => {
    const mockLab = { id: 1, name: 'Test Lab', address: '123 Test St', phone: '12345678', email: 'test@test.com', openingHours: '8-5', specializations: '', isActive: true, createdAt: '2024-03-29T10:00:00' };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('1');
    mockLaboratoryService.getById.and.returnValue(of(mockLab));

    // Recreate component to trigger ngOnInit with new mock
    fixture = TestBed.createComponent(LabManagementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBeTrue();
    expect(component.labId).toBe(1);
    expect(component.form.controls['name'].value).toBe('Test Lab');
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(mockLaboratoryService.create).not.toHaveBeenCalled();
    expect(mockLaboratoryService.update).not.toHaveBeenCalled();
  });

  it('should successfully create laboratory', fakeAsync(() => {
    component.form.setValue({
      name: 'New Lab',
      address: '123 New St',
      phone: '12345678',
      email: 'new@lab.com',
      openingHours: '08:00 - 18:00',
      specializations: 'Blood',
      isActive: true
    });
    mockLaboratoryService.create.and.returnValue(of({} as any));

    component.onSubmit();
    tick(1200);
    tick(3000); // Clear snackbar timeout

    expect(mockLaboratoryService.create).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/front/laboratorystaff/laboratories']);
  }));

  it('should successfully update laboratory', fakeAsync(() => {
    // Setup edit mode
    component.isEditMode = true;
    component.labId = 1;
    component.form.setValue({
      name: 'Updated Lab',
      address: '123 Updated St',
      phone: '12345678',
      email: 'updated@lab.com',
      openingHours: '08:00 - 18:00',
      specializations: 'Blood',
      isActive: false
    });
    mockLaboratoryService.update.and.returnValue(of({} as any));

    component.onSubmit();
    tick(1200);
    tick(3000); // Clear snackbar timeout

    expect(mockLaboratoryService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/front/laboratorystaff/laboratories']);
  }));

  it('should handle creation error', () => {
    component.form.setValue({
      name: 'New Lab Error',
      address: '123 New St',
      phone: '12345678',
      email: 'new@lab.com',
      openingHours: '08:00 - 18:00',
      specializations: 'Blood',
      isActive: true
    });
    mockLaboratoryService.create.and.returnValue(throwError(() => new Error('Creation failed')));

    component.onSubmit();

    expect(component.isSaving).toBeFalse();
    expect(component.snackbarVisible).toBeTrue();
  });
});
