import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../../../services/event.service';
import { MedicalEvent, EventType } from '../../../../../models/event.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-events-discovery',
  templateUrl: './events-discovery.component.html',
  styleUrls: ['./events-discovery.component.scss']
})
export class EventsDiscoveryComponent implements OnInit {
  events: MedicalEvent[] = [];
  filteredEvents: MedicalEvent[] = [];
  loading = false;
  
  viewMode: 'ALL' | 'UPCOMING' = 'ALL';
  typeFilter: 'ALL' | EventType = 'ALL';
  searchTerm = '';

  isAuthenticated = false;

  constructor(
    private eventService: EventService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    const request = this.viewMode === 'UPCOMING' 
      ? this.eventService.getUpcomingEvents() 
      : this.eventService.getAllEvents();

    request.subscribe({
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

  setViewMode(mode: 'ALL' | 'UPCOMING') {
    this.viewMode = mode;
    this.loadEvents();
  }

  viewDetails(id: number) {
    if (!this.isAuthenticated) {
        alert('Please log in to view event details and register.');
        this.router.navigate(['/auth/login']);
        return;
    }
    this.router.navigate(['/front/events', id]);
  }

  suggestEvent() {
    alert('Thank you for your interest! The "Suggest Event Idea" feature will be available in a future update.');
  }
}
