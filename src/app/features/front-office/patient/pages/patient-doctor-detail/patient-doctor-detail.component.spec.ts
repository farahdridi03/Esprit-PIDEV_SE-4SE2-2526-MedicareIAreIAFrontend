import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PatientDoctorDetailComponent } from './patient-doctor-detail.component';
import { DoctorService } from '../../../../../services/doctor.service';
import { ScheduleService } from '../../../../../services/schedule.service';
import { ReviewService } from '../../../../../services/review.service';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { Review } from '../../../../../models/review.model';

describe('PatientDoctorDetailComponent', () => {
  let component: PatientDoctorDetailComponent;
  let fixture: ComponentFixture<PatientDoctorDetailComponent>;
  let doctorService: jasmine.SpyObj<DoctorService>;
  let reviewService: jasmine.SpyObj<ReviewService>;
  let authService: jasmine.SpyObj<AuthService>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let router: Router;

  const mockDoctor = {
    id: 1,
    fullName: 'John Doe',
    specialty: 'Cardiology',
    clinicName: 'Heart Clinic',
    consultationFee: 100,
    isProfileComplete: true,
    licenseNumber: 'L123'
  };

  const mockReview: Review = {
    id: 1,
    rating: 5,
    comment: 'Great doctor!',
    patientName: 'Alice',
    patientId: 2,
    doctorId: 1,
    createdAt: '2026-03-20',
    isAnonymous: false
  };

  beforeEach(async () => {
    const doctorSpy = jasmine.createSpyObj('DoctorService', ['getDoctor', 'getMonthAvailabilities', 'getAvailableSlots']);
    const reviewSpy = jasmine.createSpyObj('ReviewService', ['getReviews', 'addReview', 'updateReview', 'deleteReview']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUserId', 'getUserFullName']);
    const appointmentSpy = jasmine.createSpyObj('AppointmentService', ['bookAppointment']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      declarations: [PatientDoctorDetailComponent],
      providers: [
        { provide: DoctorService, useValue: doctorSpy },
        { provide: ReviewService, useValue: reviewSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: AppointmentService, useValue: appointmentSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDoctorDetailComponent);
    component = fixture.componentInstance;
    doctorService = TestBed.inject(DoctorService) as jasmine.SpyObj<DoctorService>;
    reviewService = TestBed.inject(ReviewService) as jasmine.SpyObj<ReviewService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
    router = TestBed.inject(Router);

    doctorService.getDoctor.and.returnValue(of(mockDoctor as any));
    reviewService.getReviews.and.returnValue(of([mockReview]));
    doctorService.getMonthAvailabilities.and.returnValue(of([]));
    doctorService.getAvailableSlots.and.returnValue(of([]));
    authService.getUserId.and.returnValue(1);

    fixture.detectChanges(); // Run ngOnInit to initialize doctorId
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctor details and reviews on init', () => {
    // ngOnInit already called in beforeEach
    expect(doctorService.getDoctor).toHaveBeenCalledWith(1);
    expect(reviewService.getReviews).toHaveBeenCalledWith(1);
    expect(component.doctor).toEqual(mockDoctor as any);
    expect(component.reviews.length).toBe(1);
  });

  it('should change tabs', () => {
    component.setTab('availability');
    expect(component.activeTab).toBe('availability');
    component.setTab('review');
    expect(component.activeTab).toBe('review');
  });

  it('should detect bad words in review', () => {
    component.newReviewComment = 'This is a bad service';
    component.newReviewRating = 1;
    component.submitReview();
    expect(component.reviewError).toBe('Mots non autorisés détectés. Merci de rester courtois et positif.');
  });

  it('should validate rating before submitting review', () => {
    component.newReviewComment = 'Perfectly fine comment long enough';
    component.newReviewRating = 0;
    component.submitReview();
    expect(component.reviewError).toBe('Veuillez attribuer une note (étoiles) avant de publier.');
  });

  it('should submit a valid review', () => {
    component.newReviewComment = 'Excellent medical care provided';
    component.newReviewRating = 5;
    reviewService.addReview.and.returnValue(of({ ...mockReview, comment: 'Excellent medical care provided' }));
    
    component.submitReview();
    
    expect(reviewService.addReview).toHaveBeenCalled();
    expect(component.reviews[0].comment).toBe('Excellent medical care provided');
  });

  it('should validate booking reason', () => {
    component.selectedSlot = { providerId: 1, startTime: '2026-03-30T10:00:00', endTime: '2026-03-30T10:30:00', status: 'AVAILABLE', mode: 'IN_PERSON' };
    component.doctor = mockDoctor as any;
    component.customReason = '';
    component.selectedReason = '';
    component.confirmBooking();
    expect(component.bookingError).toBe('Veuillez sélectionner ou saisir un motif de consultation.');
  });

  it('should book an appointment successfully', fakeAsync(() => {
    const mockSlot = { providerId: 1, startTime: '2026-03-30T10:00:00', endTime: '2026-03-30T10:30:00', status: 'AVAILABLE', mode: 'IN_PERSON' };
    component.selectedSlot = mockSlot as any;
    component.doctor = mockDoctor as any;
    component.selectedReason = 'Routine checkup';
    
    appointmentService.bookAppointment.and.returnValue(of({ success: true }));
    const navigateSpy = spyOn(router, 'navigate');

    component.confirmBooking();
    
    expect(appointmentService.bookAppointment).toHaveBeenCalled();
    tick(1000);
    expect(navigateSpy).toHaveBeenCalledWith(['/front/patient/appointments']);
  }));

  it('should go back to doctors list', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/front/patient/doctors']);
  });

  // --- CALENDAR TESTS ---
  describe('Calendar & Slots', () => {
    it('should navigate to next month', () => {
      const initialMonth = component.currentMonthDate.getMonth();
      component.nextMonth();
      expect(component.currentMonthDate.getMonth()).toBe((initialMonth + 1) % 12);
      expect(doctorService.getMonthAvailabilities).toHaveBeenCalled();
    });

    it('should navigate to previous month', () => {
      const initialMonth = component.currentMonthDate.getMonth();
      component.prevMonth();
      const expectedMonth = initialMonth === 0 ? 11 : initialMonth - 1;
      expect(component.currentMonthDate.getMonth()).toBe(expectedMonth);
      expect(doctorService.getMonthAvailabilities).toHaveBeenCalled();
    });

    it('should select a date if active', () => {
      const day = { date: new Date(), isActive: true };
      component.selectDate(day);
      expect(component.selectedDate).toEqual(day.date);
      expect(doctorService.getAvailableSlots).toHaveBeenCalled();
    });

    it('should NOT select a date if NOT active', () => {
      const day = { date: new Date(), isActive: false };
      const callCount = doctorService.getAvailableSlots.calls.count();
      component.selectDate(day);
      expect(doctorService.getAvailableSlots.calls.count()).toBe(callCount);
    });

    it('should format date correctly', () => {
      const date = new Date(2026, 2, 25); // March 25, 2026
      expect(component.formatDate(date)).toBe('2026-03-25');
    });
  });

  // --- REVIEWS EXPANDED ---
  describe('Reviews Mutation', () => {
    it('should set rating and clear error', () => {
      component.reviewError = 'Generic error';
      component.setRating(4);
      expect(component.newReviewRating).toBe(4);
      expect(component.reviewError).toBe('');
    });

    it('should reset review form', () => {
      component.newReviewRating = 5;
      component.newReviewComment = 'Test comment';
      component.resetReviewForm();
      expect(component.newReviewRating).toBe(0);
      expect(component.newReviewComment).toBe('');
    });

    it('should start editing a review', () => {
      component.startEditReview(mockReview);
      expect(component.editingReviewId).toBe(mockReview.id);
      expect(component.newReviewRating).toBe(mockReview.rating);
      expect(component.newReviewComment).toBe(mockReview.comment);
    });

    it('should show delete modal', () => {
      component.deleteReview(123);
      expect(component.reviewToDeleteId).toBe(123);
      expect(component.showDeleteModal).toBeTrue();
    });

    it('should delete review when confirmed', () => {
      component.reviewToDeleteId = 1;
      component.reviews = [mockReview];
      reviewService.deleteReview.and.returnValue(of(void 0));
      
      component.deleteReviewConfirmed();
      
      expect(reviewService.deleteReview).toHaveBeenCalledWith(1, 1);
      expect(component.reviews.length).toBe(0);
      expect(component.showDeleteModal).toBeFalse();
    });
  });

  // --- REASONS ---
  describe('Predefined Reasons', () => {
    it('should update reasons based on doctor specialty', () => {
      component.doctor = { ...mockDoctor, specialty: 'Dermatology' } as any;
      (component as any).updatePredefinedReasons();
      expect(component.predefinedReasons).toContain('Acne');
      expect(component.predefinedReasons).toContain('Rash');
    });

    it('should use generic reasons for unknown specialty', () => {
      component.doctor = { ...mockDoctor, specialty: 'Unknown' } as any;
      (component as any).updatePredefinedReasons();
      expect(component.predefinedReasons).toContain('Routine checkup');
      expect(component.predefinedReasons).toContain('Follow-up visit');
    });
  });
});
