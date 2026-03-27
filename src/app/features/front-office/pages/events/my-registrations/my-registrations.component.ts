import { Component, OnInit } from '@angular/core';
import { EventRegistrationService } from '../../../../../services/event-registration.service';
import { EventService } from '../../../../../services/event.service';
import { EventRegistration, MedicalEvent } from '../../../../../models/event.model';
import { Router } from '@angular/router';

interface RegistrationViewModel extends EventRegistration {
  eventTitle?: string;
  eventDate?: string;
}

@Component({
  selector: 'app-my-registrations',
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.scss']
})
export class MyRegistrationsComponent implements OnInit {
  registrations: RegistrationViewModel[] = [];
  eventsMap: Map<number, MedicalEvent> = new Map();
  loading = false;
  userId!: number;

  constructor(
    private regService: EventRegistrationService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/auth/login']);
      return;
    }
    const u = JSON.parse(userStr);
    this.userId = u.id;
    if (this.userId) {
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;
    
    // Fetch all events to map titles easily
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        events.forEach(e => this.eventsMap.set(e.id, e));
        
        // Then load my registrations
        this.regService.getRegistrationsByParticipant(this.userId).subscribe({
          next: (regs) => {
            this.registrations = regs.map(r => ({
              ...r,
              eventTitle: this.eventsMap.get(r.eventId)?.title || `Event #${r.eventId}`,
              eventDate: this.eventsMap.get(r.eventId)?.date
            }));
            
            // Sort by most recent registration
            this.registrations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading registrations:', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching events map:', err);
        this.loading = false;
      }
    });
  }

  viewEvent(eventId: number) {
    this.router.navigate(['/front/events', eventId]);
  }
}
