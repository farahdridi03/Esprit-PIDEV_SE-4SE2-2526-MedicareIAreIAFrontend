import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { PatientNutritionistsListComponent } from './patient-nutritionists-list.component';
import { NutritionistService, NutritionistProfile } from '../../../../../services/nutritionist.service';

describe('PatientNutritionistsListComponent', () => {
  let component: PatientNutritionistsListComponent;
  let fixture: ComponentFixture<PatientNutritionistsListComponent>;
  let NutritionistService: NutritionistService;
  let router: Router;

  const mockNutritionists: NutritionistProfile[] = [
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
      declarations: [PatientNutritionistsListComponent],
      providers: [NutritionistService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientNutritionistsListComponent);
    component = fixture.componentInstance;
    NutritionistService = TestBed.inject(NutritionistService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load Nutritionists on init', () => {
    const spy = spyOn(NutritionistService, 'getNutritionists').and.returnValue(of(mockNutritionists));
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
    expect(component.Nutritionists.length).toBe(2);
    expect(component.specialties).toEqual(['Cardiology', 'Dermatology']);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when loading Nutritionists', () => {
    spyOn(NutritionistService, 'getNutritionists').and.returnValue(throwError(() => new Error('Error')));
    component.loadNutritionists();
    expect(component.error).toBe('Failed to load Nutritionists list. Please try again later.');
    expect(component.isLoading).toBeFalse();
  });

  it('should filter Nutritionists by search term', () => {
    component.Nutritionists = mockNutritionists;
    component.searchTerm = 'John';
    component.filterNutritionists();
    expect(component.filteredNutritionists.length).toBe(1);
    expect(component.filteredNutritionists[0].fullName).toBe('John Doe');

    component.searchTerm = 'Dermatology';
    component.filterNutritionists();
    expect(component.filteredNutritionists.length).toBe(1);
    expect(component.filteredNutritionists[0].fullName).toBe('Jane Smith');
  });

  it('should filter Nutritionists by specialty', () => {
    component.Nutritionists = mockNutritionists;
    component.selectedSpecialty = 'Cardiology';
    component.filterNutritionists();
    expect(component.filteredNutritionists.length).toBe(1);
    expect(component.filteredNutritionists[0].fullName).toBe('John Doe');
  });

  it('should navigate to Nutritionist profile', () => {
    const spy = spyOn(router, 'navigate');
    component.viewProfile(1);
    expect(spy).toHaveBeenCalledWith(['/front/patient/Nutritionists', 1]);
  });
});
