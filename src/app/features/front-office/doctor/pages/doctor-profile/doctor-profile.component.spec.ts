import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DoctorProfileComponent } from './doctor-profile.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { DoctorService } from '../../../../../services/doctor.service';
import { ClinicService } from '../../../../../services/clinic.service';

describe('DoctorProfileComponent', () => {
  let component: DoctorProfileComponent;
  let fixture: ComponentFixture<DoctorProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let doctorServiceSpy: jasmine.SpyObj<DoctorService>;
  let clinicServiceSpy: jasmine.SpyObj<ClinicService>;

  const mockProfile: any = {
    userId: 1,
    fullName: 'Dr. John Watson',
    email: 'watson@medical.com',
    specialty: 'SURGERY',
    consultationMode: 'BOTH',
    consultationFee: 150,
    licenseNumber: 'L12345',
    yearsOfExperience: 10,
    clinicId: 5,
    clinicName: 'St. Jude Hospital',
    clinicAddress: 'Baker Street 221B',
    profilePicture: 'data:image/png;base64,...'
  };

  const mockClinics = [
    { id: 5, name: 'St. Jude Hospital', verified: true },
    { id: 6, name: 'General Clinic', verified: false }
  ];

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('UserService', ['updateProfile']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    const doctorSpy = jasmine.createSpyObj('DoctorService', ['getProfile', 'updateProfile']);
    const clinicSpy = jasmine.createSpyObj('ClinicService', ['getAllClinics']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      declarations: [DoctorProfileComponent],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: DoctorService, useValue: doctorSpy },
        { provide: ClinicService, useValue: clinicSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    doctorServiceSpy = TestBed.inject(DoctorService) as jasmine.SpyObj<DoctorService>;
    clinicServiceSpy = TestBed.inject(ClinicService) as jasmine.SpyObj<ClinicService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserId.and.returnValue(1);
    doctorServiceSpy.getProfile.and.returnValue(of(mockProfile as any));
    clinicServiceSpy.getAllClinics.and.returnValue(of(mockClinics as any[]));

    fixture = TestBed.createComponent(DoctorProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load profile and verified clinics on init', () => {
    fixture.detectChanges();
    expect(doctorServiceSpy.getProfile).toHaveBeenCalledWith(1);
    expect(clinicServiceSpy.getAllClinics).toHaveBeenCalled();
    expect(component.fullName).toBe('Dr. John Watson');
    expect(component.clinics.length).toBe(1); // Only verified ones
    expect(component.clinics[0].id).toBe(5);
  });

  it('should handle error when loading profile', () => {
    doctorServiceSpy.getProfile.and.returnValue(throwError(() => new Error('Load Error')));
    fixture.detectChanges();
    expect(component.errorMessage).toBe('Impossible de charger les données du profil.');
    expect(component.isLoading).toBeFalse();
  });

  it('should update profile successfully on submit', fakeAsync(() => {
    fixture.detectChanges();
    userServiceSpy.updateProfile.and.returnValue(of({ success: true } as any));
    doctorServiceSpy.updateProfile.and.returnValue(of({ success: true } as any));
    doctorServiceSpy.getProfile.and.returnValue(of(mockProfile as any));
    
    component.fullName = 'Updated Name';
    component.password = 'newpass123';
    component.onSubmit();
    
    expect(userServiceSpy.updateProfile).toHaveBeenCalledWith(jasmine.objectContaining({
      fullName: 'Updated Name',
      password: 'newpass123'
    }));
    
    tick(); // resolve switchMap observables
    
    expect(doctorServiceSpy.updateProfile).toHaveBeenCalledWith(1, jasmine.objectContaining({
      specialty: 'SURGERY'
    }));
    
    expect(component.successMessage).toBe('Profil mis à jour avec succès.');
    expect(component.password).toBe(''); // Cleared after success
  }));

  it('should handle error during profile update', fakeAsync(() => {
    fixture.detectChanges();
    userServiceSpy.updateProfile.and.returnValue(throwError(() => new Error('Update Fail')));
    
    component.onSubmit();
    tick();
    
    expect(component.errorMessage).toBe('Une erreur est survenue lors de la mise à jour.');
    expect(component.isLoading).toBeFalse();
  }));
});
