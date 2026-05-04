import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalEvent } from '../../../../../models/event.model';
import { EventService } from '../../../../../services/event.service';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { PharmacistSidebarComponent } from '../../../pharmacist/components/pharmacist-sidebar/pharmacist-sidebar.component';
import { PharmacistTopbarComponent } from '../../../pharmacist/components/pharmacist-topbar/pharmacist-topbar.component';
import { AuthService } from '../../../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface HotelTable  { tableNumber: number; seats: any[]; }
interface StadiumRow  { rowNumber: number;   seats: any[]; }
interface StadiumSection { name: string; rows: StadiumRow[]; }
interface ConferenceRow  { rowNumber: number; seats: any[]; }

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule, 
    SidebarComponent, 
    TopbarComponent,
    PharmacistSidebarComponent,
    PharmacistTopbarComponent
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event?: MedicalEvent;
  participation: any = null;
  loading: boolean = true;
  submitting: boolean = false;
  userId?: number;
  userRole: string | null = null;
  isInPortal: boolean = false;
  
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  // Seating state
  seats: any[] = [];
  selectedSeat: any = null;
  hotelTables: HotelTable[] = [];
  stadiumSections: StadiumSection[] = [];
  conferenceRows: ConferenceRow[] = [];

  // Feedback state
  feedbackSubmitted = false;
  selectedRating = 0;
  feedbackComment = '';

  private map: L.Map | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private eventService: EventService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  get isPastEvent(): boolean {
    if (!this.event) return false;
    return new Date(this.event.date) < new Date();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isInPortal = this.router.url.includes('/pharmacist/stock/') || this.router.url.includes('/admin/');
    
    if (id) {
      this.loadEvent(id);
      this.checkParticipation(id);
      this.loadUserId();
      this.userRole = this.authService.getUserRole();
    }
  }

  private loadUserId() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      this.userId = u.id;
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  goBack(): void {
    this.location.back();
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getPublicEventById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
        if (this.event?.eventType === 'PHYSICAL') {
          this.loadSeats(id);
          setTimeout(() => this.initMap(), 500);
        }
      },
      error: (err) => {
        console.error('Error loading event detail', err);
        this.loading = false;
        this.showToast('Failed to load event details', 'error');
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
        if (res.participating) {
            this.participation = res;
        } else {
            this.participation = null;
        }
      },
      error: (err) => {
        console.error('Error checking participation', err);
      }
    });
  }

  register(): void {
    if (!this.event || this.submitting) return;

    this.submitting = true;
    this.eventService.participateInEvent(this.event.id).subscribe({
      next: () => {
        this.submitting = false;
        this.showToast('Join request sent to admin!', 'success');
        this.checkParticipation(this.event!.id);
      },
      error: (err) => {
        console.error('Error joining event', err);
        this.submitting = false;
        this.showToast(err.error?.message || 'Failed to join event', 'error');
      }
    });
  }

  cancelParticipation(): void {
    if (!this.event || this.submitting) return;
    
    this.submitting = true;
    this.eventService.cancelParticipation(this.event.id).subscribe({
      next: () => {
        this.submitting = false;
        this.participation = null;
        this.showToast('Participation cancelled', 'success');
      },
      error: (err) => {
        console.error('Error cancelling participation', err);
        this.submitting = false;
        this.showToast('Failed to cancel participation', 'error');
      }
    });
  }

  submitFeedback() {
    if (!this.event || !this.selectedRating) return;
    this.eventService.submitFeedback(this.event.id, { rating: this.selectedRating, comment: this.feedbackComment })
      .subscribe({
        next: () => {
          this.feedbackSubmitted = true;
          this.showToast('Thank you for your feedback!', 'success');
        },
        error: (err) => this.showToast('Error submitting feedback', 'error')
      });
  }

  downloadTicket() {
    if (!this.participation?.participationId) return;
    this.eventService.downloadTicket(this.participation.participationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ticket_${this.event?.title}_${this.participation.participationId}.pdf`;
        a.click();
      },
      error: (err) => this.showToast('Failed to download ticket', 'error')
    });
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 3000);
  }

  // Seating Methods
  loadSeats(id: number) {
    this.eventService.getEventSeats(id).subscribe(res => {
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

  selectSeat(seat: any) {
    if (seat.status !== 'AVAILABLE') return;
    this.selectedSeat = seat;
  }

  reserveSeat() {
    if (!this.selectedSeat || !this.event) return;
    this.eventService.reserveSeat(this.selectedSeat.id).subscribe({
      next: () => {
        this.selectedSeat.status = 'RESERVED';
        this.selectedSeat = null;
        this.loadSeats(this.event!.id);
        this.showToast('Seat reserved successfully!', 'success');
      },
      error: (err) => this.showToast('Error reserving seat', 'error')
    });
  }

  trackById(_: number, item: any) { return item.id; }
}
