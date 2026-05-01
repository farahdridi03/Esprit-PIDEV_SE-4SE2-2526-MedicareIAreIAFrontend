import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { EventDetailsComponent } from './event-details.component';
import { EventService } from '../../../../../services/event.service';
import { AuthService } from '../../../../../services/auth.service';

describe('EventDetailsComponent', () => {
  let component: EventDetailsComponent;
  let fixture: ComponentFixture<EventDetailsComponent>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
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
    eventServiceSpy = jasmine.createSpyObj('EventService', ['getEventById', 'isParticipating', 'participateInEvent', 'getEventSeats']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ EventDetailsComponent ],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
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
    eventServiceSpy.isParticipating.and.returnValue(of({ participating: false }));
    eventServiceSpy.getEventSeats.and.returnValue(of([]));
    
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

  describe('participation check', () => {
    it('should check participation status if user is logged in', fakeAsync(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 99 }));
      const mockParticipation = { participating: true, status: 'CONFIRMED', participationId: 10 };
      eventServiceSpy.isParticipating.and.returnValue(of(mockParticipation));

      fixture.detectChanges();
      tick();

      expect(eventServiceSpy.isParticipating).toHaveBeenCalledWith(1);
      expect(component.participation).toEqual(mockParticipation);
    }));

    it('should not check participation if user is not logged in', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(eventServiceSpy.isParticipating).not.toHaveBeenCalled();
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

    it('should send join request successfully when logged in', fakeAsync(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 99 }));
      fixture.detectChanges();
      tick();
      
      component.userId = 99;
      eventServiceSpy.participateInEvent.and.returnValue(of({}));
      eventServiceSpy.isParticipating.and.returnValue(of({ participating: true, status: 'PENDING' }));

      component.register();
      expect(component.registering).toBeTrue();
      
      tick();

      expect(eventServiceSpy.participateInEvent).toHaveBeenCalledWith(1);
      expect(component.toastMessage).toContain('Join request sent');
      expect(component.toastType).toBe('success');
      expect(component.registering).toBeFalsy();
      
      tick(4000); // Clear toast timer
    }));
  });
});
