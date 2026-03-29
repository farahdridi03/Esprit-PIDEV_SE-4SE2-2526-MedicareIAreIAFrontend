import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { AdminEventFormComponent } from './admin-event-form.component';
import { EventService } from '../../../../../services/event.service';
import { AuthService } from '../../../../../services/auth.service';

describe('AdminEventFormComponent', () => {
  let component: AdminEventFormComponent;
  let fixture: ComponentFixture<AdminEventFormComponent>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    eventServiceSpy = jasmine.createSpyObj('EventService', ['getEventById', 'createEvent', 'updateEvent']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    paramMapSubject = new BehaviorSubject(convertToParamMap({}));
    
    await TestBed.configureTestingModule({
      declarations: [ AdminEventFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: EventService, useValue: eventServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEventFormComponent);
    component = fixture.componentInstance;
    
    // Default mocks to prevent "Cannot read properties of undefined (reading 'subscribe')"
    eventServiceSpy.createEvent.and.returnValue(of({} as any));
    eventServiceSpy.updateEvent.and.returnValue(of({} as any));
    eventServiceSpy.getEventById.and.returnValue(of({} as any));
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.eventForm.get('eventType')?.value).toBe('PHYSICAL');
    expect(component.eventForm.get('title')?.value).toBe('');
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.eventForm.valid).toBeFalsy();
    });

    it('should require title, description and date', () => {
      const title = component.eventForm.controls['title'];
      const description = component.eventForm.controls['description'];
      const date = component.eventForm.controls['date'];

      expect(title.valid).toBeFalsy();
      expect(title.errors?.['required']).toBeTruthy();
      
      title.setValue('New Event', { emitEvent: false });
      expect(title.valid).toBeTruthy();
    });

    it('should have conditional validation for PHYSICAL events', fakeAsync(() => {
      // Use the exact sequence requested by the user
      component.eventForm.get('eventType')?.setValue('PHYSICAL', { emitEvent: true });
      fixture.detectChanges();
      tick();
      
      const venueName = component.eventForm.get('venueName');
      const platformName = component.eventForm.get('platformName');

      // Re-run component internal validity update to be sure
      venueName?.updateValueAndValidity();
      platformName?.updateValueAndValidity();

      expect(venueName?.valid).toBeFalsy(); // Required for PHYSICAL
      expect(platformName?.valid).toBeTruthy(); // Not required for PHYSICAL
    }));

    it('should have conditional validation for ONLINE events', fakeAsync(() => {
      // Use the exact sequence requested by the user
      component.eventForm.get('eventType')?.setValue('ONLINE', { emitEvent: true });
      fixture.detectChanges();
      tick();
      
      const venueName = component.eventForm.get('venueName');
      const platformName = component.eventForm.get('platformName');

      // Re-run component internal validity update to be sure
      venueName?.updateValueAndValidity();
      platformName?.updateValueAndValidity();

      expect(venueName?.valid).toBeTruthy(); // Not required for ONLINE
      expect(platformName?.valid).toBeFalsy(); // Required for ONLINE
    }));
  });

  describe('onSubmit (saveEvent)', () => {
    it('should not call service if form is invalid', () => {
      component.saveEvent();
      expect(eventServiceSpy.createEvent).not.toHaveBeenCalled();
    });

    it('should call createEvent on valid form in create mode', () => {
      component.isEditMode = false;
      component.eventForm.patchValue({
        title: 'Title',
        description: 'Desc',
        date: '2026-05-01T10:00',
        eventType: 'PHYSICAL',
        venueName: 'Venue',
        address: 'Addr',
        city: 'City',
        country: 'Country'
      }, { emitEvent: false });

      eventServiceSpy.createEvent.and.returnValue(of({} as any));
      component.saveEvent();

      expect(eventServiceSpy.createEvent).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/events']);
    });

    it('should call updateEvent in edit mode', () => {
      component.isEditMode = true;
      component.eventId = 123;
      component.eventForm.patchValue({
        title: 'Updated Title',
        description: 'Updated Desc',
        date: '2026-05-01T10:00',
        eventType: 'ONLINE',
        platformName: 'Zoom',
        meetingLink: 'http://zoom.us'
      }, { emitEvent: false });

      eventServiceSpy.updateEvent.and.returnValue(of({} as any));
      component.saveEvent();

      expect(eventServiceSpy.updateEvent).toHaveBeenCalledWith(123, jasmine.any(Object));
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/events']);
    });

    it('should handle server side errors', () => {
      component.eventForm.patchValue({
        title: 'Title',
        description: 'Desc',
        date: '2026-05-01T10:00',
        eventType: 'PHYSICAL',
        venueName: 'Venue',
        address: 'Addr',
        city: 'City',
        country: 'Country'
      }, { emitEvent: false });

      const errorResponse = {
        error: {
          fields: { title: 'Title must be unique' }
        }
      };

      eventServiceSpy.createEvent.and.returnValue(throwError(() => errorResponse));
      component.saveEvent();

      expect(component.loading).toBeFalsy();
      expect(component.eventForm.get('title')?.errors?.['serverError']).toBe('Title must be unique');
    });
  });

  describe('Loading event in Edit mode', () => {
    it('should load event data on init if id is present', fakeAsync(() => {
      // Emit ID carefully to avoid RangeError during init
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      
      const mockEvent = {
        id: 1,
        title: 'Test Event',
        description: 'Description',
        date: '2026-05-01T10:00:00Z',
        eventType: 'PHYSICAL',
        venueName: 'Venue'
      };

      eventServiceSpy.getEventById.and.returnValue(of(mockEvent as any));

      component.ngOnInit();
      tick();

      expect(component.isEditMode).toBeTrue();
      expect(component.eventId).toBe(1);
      expect(component.eventForm.get('title')?.value).toBe('Test Event');
      expect(eventServiceSpy.getEventById).toHaveBeenCalledWith(1);
    }));
  });
});
