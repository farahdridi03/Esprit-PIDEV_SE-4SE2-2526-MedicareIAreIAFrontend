import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedicalEvent, EventType } from '../../../../models/event.model';
import { EventService } from '../../../../services/event.service';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
  events: MedicalEvent[] = [];
  filteredEvents: MedicalEvent[] = [];
  loading = false;

  currentPage = 1; pageSize = 8;
  get totalPages() { return Math.ceil(this.filteredEvents.length / this.pageSize); }
  get pagedEvents() { const s = (this.currentPage - 1) * this.pageSize; return this.filteredEvents.slice(s, s + this.pageSize); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.filteredEvents.length); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  searchTerm = '';
  typeFilter: 'ALL' | EventType = 'ALL';

  constructor(private eventService: EventService, private router: Router) { }

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
    this.currentPage = 1;
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

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    return `http://localhost:8081/uploads/${imagePath}`;
  }
}