<<<<<<< HEAD
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
=======
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
>>>>>>> origin/frontVersion1

=======
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
>>>>>>> aziz
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../../services/auth.service';
import { FileUploadService } from '../../../../services/file-upload.service';
import { HomecareService } from '../../../../services/homecare.service';

import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let homecareServiceSpy: jasmine.SpyObj<HomecareService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register']);
    const fileSpy = jasmine.createSpyObj('FileUploadService', ['uploadFile']);
    const homeSpy = jasmine.createSpyObj('HomecareService', ['getAllServices']);

    await TestBed.configureTestingModule({
<<<<<<< HEAD
<<<<<<< HEAD
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterModule.forRoot([])],
      declarations: [RegisterComponent],
      schemas: [NO_ERRORS_SCHEMA]
=======

      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule],
      declarations: [RegisterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]

>>>>>>> origin/frontVersion1
    })
    .compileComponents();
=======
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: FileUploadService, useValue: fileSpy },
        { provide: HomecareService, useValue: homeSpy }
      ]
    }).compileComponents();
>>>>>>> aziz

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    homecareServiceSpy = TestBed.inject(HomecareService) as jasmine.SpyObj<HomecareService>;
    router = TestBed.inject(Router);

    homecareServiceSpy.getAllServices.and.returnValue(of([]));
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with PATIENT role by default', () => {
    expect(component.registerForm.get('role')?.value).toBe('PATIENT');
    expect(component.isPatient).toBeTrue();
  });

  it('should require pharmacyName when role is PHARMACIST', () => {
    component.registerForm.get('role')?.setValue('PHARMACIST');
    const pharmacyName = component.registerForm.get('pharmacyName');
    
    pharmacyName?.setValue('');
    expect(pharmacyName?.valid).toBeFalse();
    expect(pharmacyName?.hasError('required')).toBeTrue();
    
    pharmacyName?.setValue('My Pharmacy');
    expect(pharmacyName?.valid).toBeTrue();
  });

  it('should require specialtyIds when role is HOME_CARE_PROVIDER', () => {
    component.registerForm.get('role')?.setValue('HOME_CARE_PROVIDER');
    const specialties = component.registerForm.get('specialtyIds');
    
    specialties?.setValue([]);
    expect(specialties?.valid).toBeFalse();
    
    specialties?.setValue([1]);
    expect(specialties?.valid).toBeTrue();
  });

  it('should validate 8-digit phone number', () => {
    const phone = component.registerForm.get('phone');
    phone?.setValue('123');
    expect(phone?.hasError('pattern')).toBeTrue();
    phone?.setValue('12345678');
    expect(phone?.hasError('pattern')).toBeFalse();
  });

  it('should compute 18 years ago date for birthDate validation', () => {
    expect(component.eighteenYearsAgoDate).toBeTruthy();
    // Format YYYY-MM-DD
    expect(component.eighteenYearsAgoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should handle file selection', () => {
    const mockFile = new File([''], 'cert.pdf');
    const event = { target: { files: [mockFile] } };
    
    component.onFileSelected(event);
    
    expect(component.selectedFile).toBe(mockFile);
    expect(component.registerForm.get('certificationDocument')?.value).toBe('cert.pdf');
  });

  it('should call authService.register on submit when form is valid', fakeAsync(() => {
    // Fill minimum required fields for PATIENT
    component.registerForm.patchValue({
      fullName: 'John Doe',
      email: 'john@test.com',
      phone: '12345678',
      birthDate: '2000-01-01',
      password: 'password123',
      terms: true,
      gender: 'MALE',
      bloodType: 'O_POS',
      emergencyContactName: 'Jane',
      emergencyContactPhone: '87654321'
    });
    
    authServiceSpy.register.and.returnValue(of('Success'));
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.onSubmit();
    tick(); // Wait for navigation

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('should show error message on registration failure', fakeAsync(() => {
    component.registerForm.patchValue({
      fullName: 'John Doe',
      email: 'john@test.com',
      phone: '12345678',
      birthDate: '2000-01-01',
      password: 'password123',
      terms: true
    });
    
    const errorBody = JSON.stringify({ message: 'Email already exists' });
    authServiceSpy.register.and.returnValue(throwError(() => ({ error: errorBody })));

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Email already exists');
  }));
});
