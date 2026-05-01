import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../../services/event.service';
import { MedicalEvent } from '../../../../../models/event.model';
import { AuthService } from '../../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

interface HotelTable  { tableNumber: number; seats: any[]; }
interface StadiumRow  { rowNumber: number;   seats: any[]; }
interface StadiumSection { name: string; rows: StadiumRow[]; }
interface ConferenceRow  { rowNumber: number; seats: any[]; }

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit, OnDestroy {
  eventId!: number;
  event: MedicalEvent | null = null;
  loading = false;
  registering = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  userId!: number;
  participation: any = null;
  
  // Seat map state
  seats: any[] = [];
  selectedSeat: any = null;

  hotelTables: HotelTable[] = [];
  stadiumSections: StadiumSection[] = [];
  conferenceRows: ConferenceRow[] = [];

  // Feedback state
  feedbackSubmitted = false;
  selectedRating = 0;
  feedbackComment = '';

  // Map state
  private map: L.Map | null = null;

  get isPastEvent(): boolean {
    if (!this.event) return false;
    return new Date(this.event.date) < new Date();
  }
  
  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventId = +id;
        this.loadEvent();
        this.checkParticipationStatus();
      }
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  loadEvent() {
    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (res) => {
        this.event = res;
        this.loading = false;
        if (this.event && this.event.eventType === 'PHYSICAL') {
          this.loadSeats();
          setTimeout(() => this.initMap(), 500); // Wait for DOM
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private initMap() {
    if (!this.event || this.event.eventType !== 'PHYSICAL' || this.map) return;

    const address = `${this.event.address}, ${this.event.city}, ${this.event.country}`;
    
    // Geocoding using Nominatim (free OSM service)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        let lat = 36.8065; // Default Tunis
        let lon = 10.1815;

        if (results && results.length > 0) {
          lat = parseFloat(results[0].lat);
          lon = parseFloat(results[0].lon);
        }

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
        // Fallback to default view if geocoding fails
        this.map = L.map('event-map').setView([36.8065, 10.1815], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      }
    });
  }

  loadSeats() {
    this.eventService.getEventSeats(this.eventId).subscribe(res => {
      this.seats = res;
      this.groupSeats();
    });
  }

  groupSeats() {
    if (!this.event) return;
    switch (this.event.venueType) {
      case 'HOTEL':      this.groupHotel();      break;
      case 'STADIUM':    this.groupStadium();    break;
      case 'CONFERENCE': this.groupConference(); break;
    }
  }

  private groupHotel() {
    const map = new Map<number, any[]>();
    this.seats.forEach(s => {
      const t = s.tableNumber ?? 0;
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(s);
    });
    this.hotelTables = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([tableNumber, seats]) => ({ tableNumber, seats }));
  }

  private groupStadium() {
    const sectionMap = new Map<string, Map<number, any[]>>();
    this.seats.forEach(s => {
      const zone = s.zoneName ?? 'Zone';
      const row  = s.rowNumber ?? 0;
      if (!sectionMap.has(zone)) sectionMap.set(zone, new Map());
      const rowMap = sectionMap.get(zone)!;
      if (!rowMap.has(row)) rowMap.set(row, []);
      rowMap.get(row)!.push(s);
    });
    this.stadiumSections = Array.from(sectionMap.entries()).map(([name, rowMap]) => ({
      name,
      rows: Array.from(rowMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([rowNumber, seats]) => ({ rowNumber, seats }))
    }));
  }

  private groupConference() {
    const map = new Map<number, any[]>();
    this.seats.forEach(s => {
      const r = s.rowNumber ?? 0;
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(s);
    });
    this.conferenceRows = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNumber, seats]) => ({ rowNumber, seats }));
  }

  trackById(_: number, item: any) { return item.id; }

  checkParticipationStatus() {
    if (localStorage.getItem('token')) {
      this.eventService.isParticipating(this.eventId).subscribe({
        next: (res) => {
          if (res.participating) {
            this.participation = res;
          }
        }
      });
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.userId = JSON.parse(userStr).id;
      }
    }
  }

  register() {
    if (!localStorage.getItem('token')) {
      this.showToast('Please log in to register.', 'error');
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      return;
    }

    if (this.participation) return;

    this.registering = true;
    this.eventService.participateInEvent(this.eventId).subscribe({
      next: () => {
        this.registering = false;
        this.showToast('Join request sent to admin!', 'success');
        this.checkParticipationStatus();
      },
      error: (err) => {
        console.error(err);
        this.showToast('Request failed. Please try again.', 'error');
        this.registering = false;
      }
    });
  }

  downloadTicket() {
    if (!this.participation?.participationId) return;
    this.eventService.downloadTicket(this.participation.participationId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${this.eventId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => this.showToast('Error downloading ticket.', 'error')
    });
  }

  selectSeat(seat: any) {
    if (seat.status !== 'AVAILABLE') return;
    this.selectedSeat = seat;
  }

  reserveSeat() {
    if (!this.selectedSeat || !this.userId) return;
    this.eventService.reserveSeat(this.selectedSeat.id).subscribe({
      next: () => {
        this.showToast('Seat reserved successfully!', 'success');
        this.selectedSeat.status = 'RESERVED';
        this.selectedSeat = null;
        this.loadSeats();
      },
      error: () => {
        this.showToast('Failed to reserve seat.', 'error');
      }
    });
  }

  submitFeedback() {
    if (!this.selectedRating) return;
    this.eventService.submitFeedback(this.eventId, {
      rating: this.selectedRating,
      comment: this.feedbackComment
    }).subscribe({
      next: () => {
        this.feedbackSubmitted = true;
        this.showToast('Thank you for your feedback!', 'success');
      },
      error: () => this.showToast('Failed to submit feedback.', 'error')
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath || imagePath.trim() === '') return this.getDefaultImage(this.eventId);
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    return `http://localhost:8081/uploads/${imagePath}`;
  }

  private getDefaultImage(id: number): string {
    const images = [
      'https://images.unsplash.com/photo-1505751172107-1bc329bc0194?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1576091160550-2173599211d0?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=1200'
    ];
    return images[id % images.length];
  }
}
