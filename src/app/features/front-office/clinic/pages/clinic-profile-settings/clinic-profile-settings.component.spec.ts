import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicProfileSettingsComponent } from './clinic-profile-settings.component';
import { ClinicService } from '../../../../../services/clinic.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClinicResponseDTO } from '../../../../../models/clinic.model';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ClinicProfileSettingsComponent', () => {
  let component: ClinicProfileSettingsComponent;
  let fixture: ComponentFixture<ClinicProfileSettingsComponent>;
  let clinicService: jasmine.SpyObj<ClinicService>;
  let router: jasmine.SpyObj<Router>;

  const mockClinicData: ClinicResponseDTO = {
    id: 1,
    fullName: 'Test Clinic',
    email: 'clinic@test.com',
    phone: '12345678',
    birthDate: '1990-01-01',
    clinicName: 'MediCare Clinic',
    address: '123 Health St',
    hasEmergency: true,
    hasAmbulance: true,
    emergencyPhone: '911',
    ambulancePhone: '999'
  };

  beforeEach(async () => {
    const clinicSpy = jasmine.createSpyObj('ClinicService', ['getMe']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ClinicProfileSettingsComponent],
      providers: [
        { provide: ClinicService, useValue: clinicSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    clinicService = TestBed.inject(ClinicService) as jasmine.SpyObj<ClinicService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(console, 'error'); // Suppress console error logs in tests
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicProfileSettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clinic profile data on init', () => {
    clinicService.getMe.and.returnValue(of(mockClinicData));
    
    fixture.detectChanges(); // ngOnInit

    expect(clinicService.getMe).toHaveBeenCalled();
    expect(component.clinic).toEqual(mockClinicData);
    expect(component.loading).toBeFalse();
  });

  it('should display clinic-specific info when loaded', () => {
    clinicService.getMe.and.returnValue(of(mockClinicData));
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.user-name').textContent).toContain('Test Clinic');
    // Check for emergency phone
    const infoItems = fixture.debugElement.queryAll(By.css('.info-item'));
    const emergencyItem = infoItems.find(item => item.nativeElement.textContent.includes('Emergency Phone'));
    expect(emergencyItem).toBeTruthy();
    expect(emergencyItem?.nativeElement.textContent).toContain('911');
  });

  it('should navigate to edit page on update click', () => {
    clinicService.getMe.and.returnValue(of(mockClinicData));
    fixture.detectChanges();

    component.onUpdate();

    expect(router.navigate).toHaveBeenCalledWith(['/front/clinic/profile/edit']);
  });

  it('should handle error when loading fails', () => {
    clinicService.getMe.and.returnValue(throwError(() => new Error('Failed')));
    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to load profile. Please try again later.');
  });
});
