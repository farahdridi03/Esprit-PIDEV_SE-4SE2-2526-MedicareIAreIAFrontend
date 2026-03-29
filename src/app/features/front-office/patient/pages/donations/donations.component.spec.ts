import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonationsComponent } from './donations.component';
import { DonationService } from '../../../../../services/donation.service';
import { AuthService } from '../../../../../services/auth.service';
import { UserService } from '../../../../../services/user.service';
import { NotificationService } from '../../../../../services/notification.service';

import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

// ✅ IMPORTS FIX
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DonationsComponent', () => {
  let component: DonationsComponent;
  let fixture: ComponentFixture<DonationsComponent>;

  let donationServiceMock: any;
  let authServiceMock: any;
  let userServiceMock: any;
  let notificationServiceMock: any;

  beforeEach(async () => {

    // 🔹 MOCKS
    donationServiceMock = {
      getAllDonations: jasmine.createSpy().and.returnValue(of([])),
      createDonation: jasmine.createSpy().and.returnValue(of({})),
      updateDonation: jasmine.createSpy().and.returnValue(of({})),
      deleteDonation: jasmine.createSpy().and.returnValue(of()),
      getAidRequestsByPatient: jasmine.createSpy().and.returnValue(of([])),
      createAidRequest: jasmine.createSpy().and.returnValue(of({}))
    };

    authServiceMock = {
      getUserFullName: jasmine.createSpy().and.returnValue('Test User'),
      getUserId: jasmine.createSpy().and.returnValue(1),
      getUserEmail: jasmine.createSpy().and.returnValue('test@test.com')
    };

    userServiceMock = {
      getProfile: jasmine.createSpy().and.returnValue(of({ id: 1 }))
    };

    notificationServiceMock = {
      addNotification: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      declarations: [DonationsComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule // ✅ FIX HttpClient error
      ],
      providers: [
        { provide: DonationService, useValue: donationServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA] // ✅ FIX app-sidebar / app-topbar
    }).compileComponents();

    fixture = TestBed.createComponent(DonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ✅ TESTS

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load donations on init', () => {
    expect(donationServiceMock.getAllDonations).toHaveBeenCalled();
  });

  it('should filter money donations', () => {
    component.donations = [
      { type: component.DonationType.MONEY } as any,
      { type: component.DonationType.MATERIEL } as any
    ];

    component.setFilter('money');
    const result = component.filteredDonations();

    expect(result.length).toBe(1);
  });

  it('should return all donations', () => {
    component.donations = [{}, {}] as any;

    component.setFilter('all');
    expect(component.filteredDonations().length).toBe(2);
  });

  it('should return initials', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
  });

  it('should return UN if name is empty', () => {
    expect(component.getInitials(undefined)).toBe('UN');
  });

  it('should open modal', () => {
    component.openModal();
    expect(component.isModalOpen).toBeTrue();
  });

  it('should close modal', () => {
    component.isModalOpen = true;
    component.closeModal();
    expect(component.isModalOpen).toBeFalse();
  });

  it('should call createDonation', () => {
    component.currentPatientId = 1;
    component.editingDonationId = null;

    component.saveDonation();

    expect(donationServiceMock.createDonation).toHaveBeenCalled();
  });

  it('should call updateDonation', () => {
    component.editingDonationId = 1;

    component.saveDonation();

    expect(donationServiceMock.updateDonation).toHaveBeenCalled();
  });

  it('should delete donation', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteDonation(1);

    expect(donationServiceMock.deleteDonation).toHaveBeenCalledWith(1);
  });

});