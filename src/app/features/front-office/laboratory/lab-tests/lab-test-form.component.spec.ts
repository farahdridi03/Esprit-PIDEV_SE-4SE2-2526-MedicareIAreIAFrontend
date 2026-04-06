import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { LabTestFormComponent } from './lab-test-form.component';
import { LabTestService } from '../../../../services/lab-test.service';
import { of, throwError } from 'rxjs';

describe('LabTestFormComponent', () => {
  let component: LabTestFormComponent;
  let fixture: ComponentFixture<LabTestFormComponent>;
  let mockLabTestService: jasmine.SpyObj<LabTestService>;

  beforeEach(async () => {
    mockLabTestService = jasmine.createSpyObj('LabTestService', ['create', 'update']);

    await TestBed.configureTestingModule({
      declarations: [ LabTestFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: LabTestService, useValue: mockLabTestService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('durationMinutes')?.value).toBe(30);
  });

  it('should patch values when editTest is provided', () => {
    component.editTest = {
      id: 1,
      name: 'Test Edit',
      testType: 'BLOOD_TEST',
      category: 'General',
      durationMinutes: 45,
      price: 15.5,
      laboratoryId: 1,
      requiresFasting: true,
      requiresAppointment: false,
      genderSpecific: 'ALL',
      description: 'A test'
    } as any;
    
    component.ngOnInit();
    
    expect(component.isEditMode).toBeTrue();
    expect(component.form.get('name')?.value).toBe('Test Edit');
    expect(component.form.get('durationMinutes')?.value).toBe(45);
  });

  it('should mark form invalid if required fields are missing', () => {
    component.form.patchValue({ name: '' });
    expect(component.form.invalid).toBeTrue();
  });

  it('should call create when submitting a new test', () => {
    mockLabTestService.create.and.returnValue(of({} as any));
    
    component.form.patchValue({
      name: 'New Test',
      category: 'General',
      testType: 'BLOOD_TEST',
      laboratoryId: 1,
      price: 100,
      durationMinutes: 30,
      genderSpecific: 'ALL'
    });
    
    component.onSubmit();
    
    expect(mockLabTestService.create).toHaveBeenCalled();
  });

  it('should call update when submitting in edit mode', () => {
    mockLabTestService.update.and.returnValue(of({} as any));
    
    component.editTest = { id: 1 } as any;
    component.ngOnInit();
    
    component.form.patchValue({
      name: 'Updated Test',
      category: 'General',
      testType: 'BLOOD_TEST',
      laboratoryId: 1,
      price: 100,
      durationMinutes: 30,
      genderSpecific: 'ALL'
    });
    
    component.onSubmit();
    
    expect(mockLabTestService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
  });

  it('should handle submission error', () => {
    mockLabTestService.create.and.returnValue(throwError(() => new Error('Error')));
    
    component.form.patchValue({
      name: 'Error Test',
      category: 'General',
      testType: 'BLOOD_TEST',
      laboratoryId: 1,
      price: 100,
      durationMinutes: 30,
      genderSpecific: 'ALL'
    });
    
    component.onSubmit();
    
    expect(component.isSubmitting).toBeFalse();
    expect(component.submitError).not.toBeNull();
  });
});
