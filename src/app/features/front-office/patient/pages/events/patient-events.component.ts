import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../../../services/event.service';
import { MedicalEvent } from '../../../../../models/event.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-events',
  templateUrl: './patient-events.component.html',
  styleUrls: ['./patient-events.component.scss']
})
export class PatientEventsComponent implements OnInit {
  events: MedicalEvent[] = [];
  filteredEvents: MedicalEvent[] = [];
  loading = false;
  searchTerm = '';
  typeFilter: 'ALL' | 'ONLINE' | 'PHYSICAL' = 'ALL';

  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (res) => {
        this.events = res.map(ev => ({
          ...ev,
          imageUrl: this.getImageUrl(ev.imageUrl, ev.id)
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading events', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredEvents = this.events.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          (e.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchType = this.typeFilter === 'ALL' || e.eventType === this.typeFilter;
      return matchSearch && matchType;
    });
  }

  viewEventDetails(id: number): void {
    this.router.navigate(['/front/events', id]);
  }

  getImageUrl(imagePath: string | undefined, id: number): string {
    if (!imagePath || imagePath.trim() === '') return this.getDefaultImage(id);
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
}
