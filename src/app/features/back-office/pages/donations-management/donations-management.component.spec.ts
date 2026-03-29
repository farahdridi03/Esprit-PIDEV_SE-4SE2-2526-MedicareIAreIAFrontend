import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonationsManagementComponent } from './donations-management.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { DonationService } from '../../../../services/donation.service';
import { NotificationService } from '../../../../services/notification.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DonationStatus, DonationType, AidRequestStatus } from '../../../../models/donation.model';

describe('DonationsManagementComponent', () => {
  let component: DonationsManagementComponent;
  let fixture: ComponentFixture<DonationsManagementComponent>;
  let donationServiceMock: any;
  let notificationServiceMock: any;

  beforeEach(async () => {
    donationServiceMock = {
      getAllDonations: jasmine.createSpy('getAllDonations').and.returnValue(of([])),
      getAllAidRequests: jasmine.createSpy('getAllAidRequests').and.returnValue(of([])),
      updateDonation: jasmine.createSpy('updateDonation').and.returnValue(of({})),
      deleteDonation: jasmine.createSpy('deleteDonation').and.returnValue(of({})),
      updateAidRequestStatus: jasmine.createSpy('updateAidRequestStatus').and.returnValue(of({})),
      assignDonation: jasmine.createSpy('assignDonation').and.returnValue(of({}))
    };

    notificationServiceMock = {
      addPatientNotification: jasmine.createSpy('addPatientNotification')
    };

    await TestBed.configureTestingModule({
      declarations: [DonationsManagementComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: DonationService, useValue: donationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load donations and requests on init', () => {
    expect(donationServiceMock.getAllDonations).toHaveBeenCalled();
    expect(donationServiceMock.getAllAidRequests).toHaveBeenCalled();
  });

  it('should switch tabs', () => {
    component.switchTab('REQUESTS');
    expect(component.currentTab).toEqual('REQUESTS');
  });

  it('should block deletion without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteDonation(1);
    expect(donationServiceMock.deleteDonation).not.toHaveBeenCalled();
  });

  it('should allow deletion with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteDonation(1);
    expect(donationServiceMock.deleteDonation).toHaveBeenCalledWith(1);
  });

  it('should return initials correctly', () => {
    expect(component.getInitials('John Doe')).toEqual('JO');
    expect(component.getInitials(undefined)).toEqual('UN');
  });

  it('should open assign modal correctly', () => {
    component.donations = [{ id: 1, status: DonationStatus.AVAILABLE, type: DonationType.MONEY } as any];
    component.openAssignModal({ id: 2, status: AidRequestStatus.PENDING } as any);
    expect(component.showAssignModal).toBeTrue();
    expect(component.selectedReq?.id).toEqual(2);
    expect(component.availableDonations.length).toEqual(1);
  });

  it('should confirm assignment and trigger notification', () => {
    component.selectedReq = { id: 5, patientId: 10 } as any;
    component.selectedDonationId = 3;
    
    component.confirmAssignment();
    
    expect(donationServiceMock.assignDonation).toHaveBeenCalledWith({
      donationId: 3,
      aidRequestId: 5
    });
    expect(notificationServiceMock.addPatientNotification).toHaveBeenCalledWith(
      10,
      'Request Approved 🎉',
      jasmine.any(String),
      'info'
    );
    expect(component.showAssignModal).toBeFalse();
  });
});
