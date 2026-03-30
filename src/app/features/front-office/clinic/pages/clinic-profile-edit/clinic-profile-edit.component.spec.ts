import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ClinicProfileEditComponent } from './clinic-profile-edit.component';
import { ClinicService } from '../../../../../services/clinic.service';
import { UserService } from '../../../../../services/user.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ClinicResponseDTO } from '../../../../../models/clinic.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ClinicProfileEditComponent', () => {
    let component: ClinicProfileEditComponent;
    let fixture: ComponentFixture<ClinicProfileEditComponent>;
    let clinicService: jasmine.SpyObj<ClinicService>;
    let userService: jasmine.SpyObj<UserService>;
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
        const clinicSpy = jasmine.createSpyObj('ClinicService', ['getMe', 'updateProfile']);
        const userSpy = jasmine.createSpyObj('UserService', ['refreshProfile']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [ClinicProfileEditComponent],
            imports: [ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: ClinicService, useValue: clinicSpy },
                { provide: UserService, useValue: userSpy },
                { provide: Router, useValue: routerSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        clinicService = TestBed.inject(ClinicService) as jasmine.SpyObj<ClinicService>;
        userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        spyOn(console, 'error'); // Suppress console error logs in tests
    });

    beforeEach(() => {
        clinicService.getMe.and.returnValue(of(mockClinicData));
        fixture = TestBed.createComponent(ClinicProfileEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // ngOnInit
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with clinic data', () => {
        expect(component.profileForm.value.fullName).toBe('Test Clinic');
        expect(component.profileForm.getRawValue().email).toBe('clinic@test.com');
        expect(component.profileForm.value.clinicName).toBe('MediCare Clinic');
        expect(component.loading).toBeFalse();
    });

    it('should be invalid if required fields are missing', () => {
        component.profileForm.patchValue({
            fullName: '',
            clinicName: '',
            address: ''
        });
        expect(component.profileForm.invalid).toBeTrue();
    });

    it('should call updateProfile and navigate on successful submission', () => {
        clinicService.updateProfile.and.returnValue(of(mockClinicData));
        
        component.onSubmit();

        expect(clinicService.updateProfile).toHaveBeenCalled();
        expect(userService.refreshProfile).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/front/clinic/profile']);
        expect(component.saving).toBeFalse();
    });

    it('should handle error on submission failure', () => {
        clinicService.updateProfile.and.returnValue(throwError(() => new Error('Update failed')));
        
        component.onSubmit();

        expect(component.saving).toBeFalse();
        expect(component.error).toBe('Failed to update profile. Please try again later.');
    });

    it('should navigate back on cancel', () => {
        component.onCancel();
        expect(router.navigate).toHaveBeenCalledWith(['/front/clinic/profile']);
    });
});
