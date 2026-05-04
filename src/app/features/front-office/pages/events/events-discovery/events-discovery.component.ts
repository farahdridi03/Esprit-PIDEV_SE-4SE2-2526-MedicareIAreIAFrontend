import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../../../services/event.service';
import { MedicalEvent, EventType } from '../../../../../models/event.model';
import { AuthService } from '../../../../../services/auth.service';
import { EventSuggestionService } from '../../../../../services/event-suggestion.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-events-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  showSuggestModal = false;
  suggestionTitle = '';
  suggestionDesc = '';
  submittingSuggestion = false;

  constructor(
    private eventService: EventService,
    private router: Router,
    private authService: AuthService,
    private suggestionService: EventSuggestionService
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
    
    const role = this.authService.getUserRole();
    if (role === 'PHARMACIST') {
        this.router.navigate(['/front/events', id]);
    } else if (role === 'PATIENT') {
        this.router.navigate(['/front/events', id]); // Or /front/patient/events if they have a specific page
    } else {
        this.router.navigate(['/front/events', id]);
    }
  }

  suggestEvent() {
    if (!this.isAuthenticated) {
      alert('Please log in to suggest an event.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.showSuggestModal = true;
  }

  closeSuggestModal() {
    this.showSuggestModal = false;
    this.suggestionTitle = '';
    this.suggestionDesc = '';
  }

  submitSuggestion() {
    if (!this.suggestionTitle || !this.suggestionDesc) return;

    this.submittingSuggestion = true;
    this.suggestionService.suggestEvent({
      title: this.suggestionTitle,
      description: this.suggestionDesc
    }).subscribe({
      next: () => {
        alert('Thank you! Your suggestion has been sent to the admin.');
        this.closeSuggestModal();
        this.submittingSuggestion = false;
      },
      error: (err) => {
        console.error('Error submitting suggestion', err);
        alert('Failed to send suggestion. Please try again.');
        this.submittingSuggestion = false;
      }
    });
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
