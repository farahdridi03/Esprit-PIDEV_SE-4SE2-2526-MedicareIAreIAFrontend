import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { EventDetailsComponent } from './event-details.component';
import { EventService } from '../../../../../services/event.service';
import { EventRegistrationService } from '../../../../../services/event-registration.service';
import { AuthService } from '../../../../../services/auth.service';

describe('EventDetailsComponent', () => {
  let component: EventDetailsComponent;
  let fixture: ComponentFixture<EventDetailsComponent>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let registrationServiceSpy: jasmine.SpyObj<EventRegistrationService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockEvent = {
    id: 1,
    title: 'Health Event',
    description: 'A great event',
    date: '2026-05-01',
    eventType: 'PHYSICAL',
    venueName: 'Venue'
  };

  beforeEach(async () => {
    eventServiceSpy = jasmine.createSpyObj('EventService', ['getEventById']);
    registrationServiceSpy = jasmine.createSpyObj('EventRegistrationService', ['getRegistrationsByParticipant', 'registerToEvent']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ EventDetailsComponent ],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: EventRegistrationService, useValue: registrationServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' }))
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailsComponent);
    component = fixture.componentInstance;
    
    // Default mock returns
    eventServiceSpy.getEventById.and.returnValue(of(mockEvent as any));
    registrationServiceSpy.getRegistrationsByParticipant.and.returnValue(of([]));
    
    localStorage.clear();
  });

  it('should create and load event data', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component).toBeTruthy();
    expect(component.eventId).toBe(1);
    expect(eventServiceSpy.getEventById).toHaveBeenCalledWith(1);
    expect(component.event).toEqual(mockEvent as any);
  }));

  describe('registration check', () => {
    it('should check registration status if user is logged in', fakeAsync(() => {
      localStorage.setItem('user', JSON.stringify({ id: 99 }));
      const mockReg = { id: 10, eventId: 1, participantId: 99, status: 'REGISTERED' };
      registrationServiceSpy.getRegistrationsByParticipant.and.returnValue(of([mockReg as any]));

      fixture.detectChanges();
      tick();

      expect(registrationServiceSpy.getRegistrationsByParticipant).toHaveBeenCalledWith(99);
      expect(component.userRegistration).toEqual(mockReg as any);
    }));

    it('should not check registration if user is not in localStorage', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(registrationServiceSpy.getRegistrationsByParticipant).not.toHaveBeenCalled();
    }));
  });

  describe('register logic', () => {
    it('should navigate to login if user not logged in', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      
      component.register();
      expect(component.toastMessage).toContain('Please log in');
      expect(component.toastType).toBe('error');
      
      tick(2000); // 2 seconds delay in component for navigation
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
      
      tick(4000); // Clear toast timer
    }));

    it('should register successfully when logged in and not registered', fakeAsync(() => {
      localStorage.setItem('user', JSON.stringify({ id: 99 }));
      fixture.detectChanges();
      tick();
      
      component.userId = 99;
      const mockReg = { id: 10, eventId: 1, participantId: 99, status: 'REGISTERED' };
      const regSubject = new Subject<any>();
      registrationServiceSpy.registerToEvent.and.returnValue(regSubject);

      component.register();
      expect(component.registering).toBeTrue();
      
      regSubject.next(mockReg);
      regSubject.complete();
      tick();

      expect(registrationServiceSpy.registerToEvent).toHaveBeenCalledWith({
          eventId: 1,
          participantId: 99
      });
      expect(component.userRegistration).toEqual(mockReg as any);
      expect(component.toastType).toBe('success');
      expect(component.registering).toBeFalsy();
      
      tick(4000); // Clear toast timer
    }));

    it('should handle already registered error', fakeAsync(() => {
      localStorage.setItem('user', JSON.stringify({ id: 99 }));
      fixture.detectChanges();
      tick();
      
      component.userId = 99;
      const alreadyRegisteredError = { error: { message: 'User already registered for this event' } };
      registrationServiceSpy.registerToEvent.and.returnValue(throwError(() => alreadyRegisteredError));

      component.register();
      tick();
      
      expect(component.toastMessage).toContain('already registered');
      expect(component.toastType).toBe('error');
      tick(4000); // Clear toast timer
    }));

    it('should handle "event is full" error simulated via generic error message', fakeAsync(() => {
        localStorage.setItem('user', JSON.stringify({ id: 99 }));
        fixture.detectChanges();
        tick();
        
        component.userId = 99;
        const fullError = { error: { message: 'Registration failed: event is full' } };
        registrationServiceSpy.registerToEvent.and.returnValue(throwError(() => fullError));

        component.register();
        tick();
        
        expect(component.toastMessage).toContain('Registration failed');
        expect(component.toastType).toBe('error');
        tick(4000); // Clear toast timer
    }));
  });
});
