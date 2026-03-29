import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminEventsListComponent } from './admin-events-list.component';
import { EventService } from '../../../../../services/event.service';
import { MedicalEvent } from '../../../../../models/event.model';
import { FormsModule } from '@angular/forms';

describe('AdminEventsListComponent', () => {
  let component: AdminEventsListComponent;
  let fixture: ComponentFixture<AdminEventsListComponent>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockEvents: MedicalEvent[] = [
    { id: 1, title: 'Health Fair 1', description: 'Desc 1', date: '2026-05-01', eventType: 'PHYSICAL' },
    { id: 2, title: 'Online Webinar', description: 'Desc 2', date: '2026-06-01', eventType: 'ONLINE' }
  ];

  beforeEach(async () => {
    eventServiceSpy = jasmine.createSpyObj('EventService', ['getAllEvents', 'deleteEvent']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ AdminEventsListComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEventsListComponent);
    component = fixture.componentInstance;
    eventServiceSpy.getAllEvents.and.returnValue(of(mockEvents));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(eventServiceSpy.getAllEvents).toHaveBeenCalled();
  });

  it('should load events and populate filteredEvents', () => {
    expect(component.events.length).toBe(2);
    expect(component.filteredEvents.length).toBe(2);
  });

  describe('Filtering', () => {
    it('should filter by search term (case insensitive)', () => {
      component.searchTerm = 'webinar';
      component.applyFilters();
      expect(component.filteredEvents.length).toBe(1);
      expect(component.filteredEvents[0].title).toBe('Online Webinar');
    });

    it('should filter by event type', () => {
      component.typeFilter = 'PHYSICAL';
      component.applyFilters();
      expect(component.filteredEvents.length).toBe(1);
      expect(component.filteredEvents[0].eventType).toBe('PHYSICAL');
    });

    it('should show all when typeFilter is ALL', () => {
      component.typeFilter = 'ALL';
      component.applyFilters();
      expect(component.filteredEvents.length).toBe(2);
    });
  });

  describe('Actions', () => {
    it('should navigate to edit page', () => {
      component.editEvent(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/events/edit', 1]);
    });

    it('should navigate to registrations page', () => {
      component.viewRegistrations(1);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/events', 1, 'registrations']);
    });

    it('should navigate to create event page', () => {
        component.createEvent();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/events/create']);
    });

    it('should call deleteEvent and reload if confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      eventServiceSpy.deleteEvent.and.returnValue(of(undefined));
      
      // Clear initial call from ngOnInit
      eventServiceSpy.getAllEvents.calls.reset();
      
      component.deleteEvent(1);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(eventServiceSpy.deleteEvent).toHaveBeenCalledWith(1);
      expect(eventServiceSpy.getAllEvents).toHaveBeenCalled();
    });

    it('should not call deleteEvent if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteEvent(1);
      expect(eventServiceSpy.deleteEvent).not.toHaveBeenCalled();
    });
  });
});
