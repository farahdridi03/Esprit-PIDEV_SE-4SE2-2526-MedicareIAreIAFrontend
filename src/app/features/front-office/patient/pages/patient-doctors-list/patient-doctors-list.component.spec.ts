import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { PatientDoctorsListComponent } from './patient-doctors-list.component';
import { DoctorService, DoctorProfile } from '../../../../../services/doctor.service';

describe('PatientDoctorsListComponent', () => {
  let component: PatientDoctorsListComponent;
  let fixture: ComponentFixture<PatientDoctorsListComponent>;
  let doctorService: DoctorService;
  let router: Router;

  const mockDoctors: DoctorProfile[] = [
    {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      specialty: 'Cardiology',
      licenseNumber: '12345',
      isProfileComplete: true,
      clinicName: 'Heart Clinic',
      consultationFee: 100
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      specialty: 'Dermatology',
      licenseNumber: '67890',
      isProfileComplete: true,
      clinicName: 'Skin Clinic',
      consultationFee: 80
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      declarations: [PatientDoctorsListComponent],
      providers: [DoctorService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDoctorsListComponent);
    component = fixture.componentInstance;
    doctorService = TestBed.inject(DoctorService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctors on init', () => {
    const spy = spyOn(doctorService, 'getDoctors').and.returnValue(of(mockDoctors));
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(component.doctors.length).toBe(2);
    expect(component.specialties).toEqual(['Cardiology', 'Dermatology']);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading doctors', () => {
    spyOn(doctorService, 'getDoctors').and.returnValue(throwError(() => new Error('Error')));
    component.loadDoctors();
    expect(component.error).toBe('Failed to load doctors list. Please try again later.');
    expect(component.isLoading).toBeFalse();
  });

  it('should filter doctors by search term', () => {
    component.doctors = mockDoctors;
    component.searchTerm = 'John';
    component.filterDoctors();
    expect(component.filteredDoctors.length).toBe(1);
    expect(component.filteredDoctors[0].fullName).toBe('John Doe');

    component.searchTerm = 'Dermatology';
    component.filterDoctors();
    expect(component.filteredDoctors.length).toBe(1);
    expect(component.filteredDoctors[0].fullName).toBe('Jane Smith');
  });

  it('should filter doctors by specialty', () => {
    component.doctors = mockDoctors;
    component.selectedSpecialty = 'Cardiology';
    component.filterDoctors();
    expect(component.filteredDoctors.length).toBe(1);
    expect(component.filteredDoctors[0].fullName).toBe('John Doe');
  });

  it('should navigate to doctor profile', () => {
    const spy = spyOn(router, 'navigate');
    component.viewProfile(1);
    expect(spy).toHaveBeenCalledWith(['/front/patient/doctors', 1]);
  });
});
