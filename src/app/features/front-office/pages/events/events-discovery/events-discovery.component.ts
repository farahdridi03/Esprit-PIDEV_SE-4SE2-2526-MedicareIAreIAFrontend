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
        // Preserve image from backend; only use default if truly absent
        this.events = res.map(ev => ({
          ...ev,
          imageUrl: (ev.imageUrl && ev.imageUrl.trim() !== '') ? this.getImageUrl(ev.imageUrl) : this.getDefaultImage(ev.id),
          attendeeImages: ev.attendeeImages || this.getMockAttendees(ev.id)
        }));
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

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    return `http://localhost:8081/uploads/${imagePath}`;
  }

  private getDefaultImage(id: number): string {
    const images = [
      'https://images.unsplash.com/photo-1505751172107-1bc329bc0194?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1576091160550-2173599211d0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800'
    ];
    return images[id % images.length];
  }

  private getMockAttendees(id: number): string[] {
    const list = [
      'https://i.pravatar.cc/150?u=1',
      'https://i.pravatar.cc/150?u=2',
      'https://i.pravatar.cc/150?u=3',
      'https://i.pravatar.cc/150?u=4',
      'https://i.pravatar.cc/150?u=5'
    ];
    // Return a random slice of 2 to 5 profiles
    const count = (id % 4) + 2;
    return list.slice(0, count);
  }
}
