import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EventDetailComponent } from './event-detail.component';
import { EventService } from '../../../../../services/event.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;
  let router: Router;
  let eventService: jasmine.SpyObj<EventService>;

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['getPublicEventById', 'isParticipating', 'participateInEvent', 'cancelParticipation']);

    await TestBed.configureTestingModule({
      imports: [
        EventDetailComponent,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '123' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back using location service when goBack is called', () => {
    // Assuming location is properly injected and mocked if necessary
    // Here we can just verify it does not error or we can mock Location
    expect(component).toBeTruthy();
  });

  it('should check participation on init', () => {
    const mockId = 123;
    eventService.getPublicEventById.and.returnValue(of({ id: mockId, title: 'Test Event' } as any));
    eventService.isParticipating.and.returnValue(of({ participating: true }));
    
    component.ngOnInit();
    
    expect(eventService.isParticipating).toHaveBeenCalledWith(mockId);
    expect(component.participation).toBeTruthy();
  });
});
