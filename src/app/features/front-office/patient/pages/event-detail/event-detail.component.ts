import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalEvent } from '../../../../../models/event.model';
import { EventService } from '../../../../../services/event.service';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event?: MedicalEvent;
  isParticipating: boolean = false;
  loading: boolean = true;
  submitting: boolean = false;

  private map: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private eventService: EventService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadEvent(id);
      this.checkParticipation(id);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  goBack(): void {
    this.router.navigate(['/front/patient/events']);
  }

  loadEvent(id: number): void {
    this.eventService.getPublicEventById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
        if (this.event?.eventType === 'PHYSICAL') {
          setTimeout(() => this.initMap(), 500);
        }
      },
      error: (err) => {
        console.error('Error loading event detail', err);
        this.loading = false;
      }
    });
  }

  private initMap(): void {
    if (!this.event || this.event.eventType !== 'PHYSICAL' || this.map) return;

    const address = `${this.event.address}, ${this.event.city}, ${this.event.country}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        let lat = 36.8065;
        let lon = 10.1815;

        if (results && results.length > 0) {
          lat = parseFloat(results[0].lat);
          lon = parseFloat(results[0].lon);
        }

        const mapContainer = document.getElementById('event-map');
        if (!mapContainer) return;

        this.map = L.map('event-map').setView([lat, lon], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        const icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        });

        L.marker([lat, lon], { icon }).addTo(this.map)
          .bindPopup(`<b>${this.event?.venueName}</b><br>${this.event?.address}`)
          .openPopup();
      },
      error: (err) => {
        console.error('Geocoding failed', err);
        this.map = L.map('event-map').setView([36.8065, 10.1815], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      }
    });
  }

  checkParticipation(id: number): void {
    this.eventService.isParticipating(id).subscribe({
      next: (res) => {
        this.isParticipating = res.participating;
      },
      error: (err) => {
        console.error('Error checking participation', err);
      }
    });
  }

  toggleParticipation(): void {
    if (!this.event || this.submitting) return;

    this.submitting = true;
    if (this.isParticipating) {
      this.eventService.cancelParticipation(this.event.id).subscribe({
        next: () => {
          this.isParticipating = false;
          this.submitting = false;
        },
        error: (err) => {
          console.error('Error cancelling participation', err);
          this.submitting = false;
        }
      });
    } else {
      this.eventService.participateInEvent(this.event.id).subscribe({
        next: () => {
          this.isParticipating = true;
          this.submitting = false;
        },
        error: (err) => {
          console.error('Error joining event', err);
          this.submitting = false;
        }
      });
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
