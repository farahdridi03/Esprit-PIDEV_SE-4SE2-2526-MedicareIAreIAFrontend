import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LaboratoryStaffProfileSettingsComponent } from './laboratory-profile-settings.component';
import { UserService } from '../../../../../services/user.service';
import { LaboratoryService } from '../../../../../services/laboratory.service';
import { UserResponseDTO } from '../../../../../models/user.model';
import { LaboratoryResponseDTO } from '../../../../../models/laboratory.model';

describe('LaboratoryStaffProfileSettingsComponent', () => {
    let component: LaboratoryStaffProfileSettingsComponent;
    let fixture: ComponentFixture<LaboratoryStaffProfileSettingsComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let laboratoryServiceSpy: jasmine.SpyObj<LaboratoryService>;
    let router: Router;

    const mockUser: UserResponseDTO = {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'LABORATORY_STAFF',
        enabled: true,
        phone: '123456789',
        birthDate: '1990-01-01'
    };

    const mockLaboratory: LaboratoryResponseDTO = {
        id: 10,
        name: 'Central Medical Lab',
        address: '456 Healthcare Blvd',
        phone: '555-9876'
    };

    beforeEach(async () => {
        const userSpy = jasmine.createSpyObj('UserService', ['getProfile']);
        const laboratorySpy = jasmine.createSpyObj('LaboratoryService', ['getMyLaboratory']);

        userSpy.getProfile.and.returnValue(of(mockUser));
        laboratorySpy.getMyLaboratory.and.returnValue(of(mockLaboratory));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [LaboratoryStaffProfileSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: UserService, useValue: userSpy },
                { provide: LaboratoryService, useValue: laboratorySpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LaboratoryStaffProfileSettingsComponent);
        component = fixture.componentInstance;
        userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
        laboratoryServiceSpy = TestBed.inject(LaboratoryService) as jasmine.SpyObj<LaboratoryService>;
        router = TestBed.inject(Router);
        spyOn(console, 'error'); // Suppress console error logs in tests
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load profile and laboratory on init', () => {
        fixture.detectChanges(); // triggers ngOnInit

        expect(userServiceSpy.getProfile).toHaveBeenCalled();
        expect(laboratoryServiceSpy.getMyLaboratory).toHaveBeenCalled();
        expect(component.user).toEqual(mockUser);
        expect(component.laboratory).toEqual(mockLaboratory);
        expect(component.loading).toBeFalse();
    });

    it('should handle error when laboratory info fails', () => {
        laboratoryServiceSpy.getMyLaboratory.and.returnValue(throwError(() => new Error('Lab error')));
        
        fixture.detectChanges();

        expect(userServiceSpy.getProfile).toHaveBeenCalled();
        expect(laboratoryServiceSpy.getMyLaboratory).toHaveBeenCalled();
        expect(component.user).toEqual(mockUser);
        expect(component.laboratory).toBeNull();
        // Page should still be loaded if user profile is fine
        expect(component.loading).toBeFalse();
    });

    it('should display laboratory information in the template', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;

        const infoItems = compiled.querySelectorAll('.info-item');
        let labNameFound = false;
        let labAddressFound = false;
        let labPhoneFound = false;

        infoItems.forEach(item => {
            const label = item.querySelector('.label')?.textContent;
            const value = item.querySelector('.value')?.textContent;

            if (label === 'Laboratory Name' && value === mockLaboratory.name) labNameFound = true;
            if (label === 'Address' && value === mockLaboratory.address) labAddressFound = true;
            if (label === 'Phone Number' && value === mockLaboratory.phone) labPhoneFound = true;
        });

        expect(labNameFound).toBeTrue();
        expect(labAddressFound).toBeTrue();
        expect(labPhoneFound).toBeTrue();
    });

    it('should navigate to edit profile on update', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.onUpdate();
        expect(navigateSpy).toHaveBeenCalledWith(['/front/laboratorystaff/profile/edit']);
    });
});
