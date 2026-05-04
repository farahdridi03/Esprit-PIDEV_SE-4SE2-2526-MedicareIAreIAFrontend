import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
      imports: [ ReactiveFormsModule, HttpClientTestingModule ],
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
    
    // Default mocks
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
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.eventForm.valid).toBeFalsy();
    });
  });

  describe('onSubmit (saveEvent)', () => {
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

      component.saveEvent();
      expect(eventServiceSpy.createEvent).toHaveBeenCalled();
    });
  });

  describe('Loading event in Edit mode', () => {
    it('should load event data on init if id is present', fakeAsync(() => {
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
      expect(eventServiceSpy.getEventById).toHaveBeenCalledWith(1);
    }));
  });
});
