import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedicalEvent, EventType } from '../../../../../models/event.model';
import { EventService } from '../../../../../services/event.service';

@Component({
  selector: 'app-admin-events-list',
  templateUrl: './admin-events-list.component.html',
  styleUrls: ['./admin-events-list.component.scss']
})
export class AdminEventsListComponent implements OnInit {
  events: MedicalEvent[] = [];
  filteredEvents: MedicalEvent[] = [];
  loading = false;
  
  searchTerm = '';
  typeFilter: 'ALL' | EventType = 'ALL';

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (res) => {
        this.events = res;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredEvents = this.events.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                          e.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = this.typeFilter === 'ALL' || e.eventType === this.typeFilter;
      return matchSearch && matchType;
    });
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => this.loadEvents(),
        error: (err) => console.error(err)
      });
    }
  }

  viewRegistrations(id: number) {
    this.router.navigate(['/admin/events', id, 'registrations']);
  }

  editEvent(id: number) {
    this.router.navigate(['/admin/events/edit', id]);
  }

  createEvent() {
    this.router.navigate(['/admin/events/create']);
  }
}
