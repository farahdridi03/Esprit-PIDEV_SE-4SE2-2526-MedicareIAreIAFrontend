import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { EventSeat, SeatZoneSummary, SeatingStats } from '../../../../models/event.model';

interface HotelTable  { tableNumber: number; seats: EventSeat[]; }
interface StadiumRow  { rowNumber: number;   seats: EventSeat[]; }
interface StadiumSection { name: string; rows: StadiumRow[]; }
interface ConferenceRow  { rowNumber: number; seats: EventSeat[]; }

@Component({
  selector: 'app-event-seat-editor',
  templateUrl: './event-seat-editor.component.html',
  styleUrls: ['./event-seat-editor.component.scss']
})
export class EventSeatEditorComponent implements OnInit, OnDestroy {

  // ── State ────────────────────────────────────────────────────────────────
  eventId!: number;
  eventTitle  = '';
  venueType   = '';          // HOTEL | STADIUM | CONFERENCE | ''
  seats: EventSeat[] = [];
  stats: SeatingStats | null = null;

  // Grouped views (computed from seats[])
  hotelTables: HotelTable[] = [];
  stadiumSections: StadiumSection[] = [];
  conferenceRows: ConferenceRow[] = [];

  // UI state
  selectedSeat: EventSeat | null = null;
  showReserveModal = false;
  searchKeyword = '';
  selectedFallbackVenue = '';
  isLoading = true;
  successMsg = '';
  errorMsg = '';

  private pollingRef: any;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEventDetails();
    this.loadStats();
    this.loadSeats();
    // Poll every 15 s for real-time updates
    this.pollingRef = setInterval(() => {
      this.loadSeats();
      this.loadStats();
    }, 15_000);
  }

  ngOnDestroy() {
    if (this.pollingRef) clearInterval(this.pollingRef);
  }

  // ── Data loaders ─────────────────────────────────────────────────────────

  loadEventDetails() {
    this.eventService.getEventById(this.eventId).subscribe({
      next: (ev: any) => {
        this.eventTitle = ev.title ?? '';
        this.venueType  = ev.venueType ?? '';
      },
      error: () => {}
    });
  }

  loadSeats() {
    const keyword = this.searchKeyword.trim();
    const req$ = keyword
      ? this.eventService.searchSeats(this.eventId, keyword)
      : this.eventService.getEventSeats(this.eventId);

    req$.subscribe({
      next: (res: EventSeat[]) => {
        this.seats = res;
        this.groupSeats();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadStats() {
    this.eventService.getSeatingStats(this.eventId).subscribe({
      next: (s: SeatingStats) => this.stats = s,
      error: () => {}
    });
  }

  // ── Seat grouping ─────────────────────────────────────────────────────────

  groupSeats() {
    switch (this.venueType) {
      case 'HOTEL':      this.groupHotel();      break;
      case 'STADIUM':    this.groupStadium();    break;
      case 'CONFERENCE': this.groupConference(); break;
    }
  }

  private groupHotel() {
    const map = new Map<number, EventSeat[]>();
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
    const sectionMap = new Map<string, Map<number, EventSeat[]>>();
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
    const map = new Map<number, EventSeat[]>();
    this.seats.forEach(s => {
      const r = s.rowNumber ?? 0;
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(s);
    });
    this.conferenceRows = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNumber, seats]) => ({ rowNumber, seats }));
  }

  // ── Search ────────────────────────────────────────────────────────────────

  onSearch() {
    this.isLoading = true;
    this.loadSeats();
  }

  clearSearch() {
    this.searchKeyword = '';
    this.loadSeats();
  }

  // ── Seat actions ──────────────────────────────────────────────────────────

  onSeatClick(seat: EventSeat) {
    if (seat.status !== 'AVAILABLE') return;
    this.selectedSeat  = seat;
    this.showReserveModal = true;
  }

  closeModal() {
    this.selectedSeat    = null;
    this.showReserveModal = false;
    this.errorMsg = '';
  }

  confirmReservation() {
    if (!this.selectedSeat) return;
    this.eventService.reserveSeat(this.selectedSeat.id).subscribe({
      next: () => {
        this.successMsg = `✅ Seat ${this.selectedSeat!.seatLabel} reserved successfully!`;
        this.closeModal();
        this.loadSeats();
        this.loadStats();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.message ?? 'Reservation failed. Please try again.';
      }
    });
  }

  // ── Layout regeneration (admin) ───────────────────────────────────────────

  regenerateLayout() {
    const typeToGen = this.venueType || this.selectedFallbackVenue;
    if (!typeToGen) return;
    if (!confirm(`Generate full ${typeToGen} layout? All existing seat data will be reset.`)) return;
    this.isLoading = true;
    this.eventService.generateLayout(this.eventId, typeToGen).subscribe({
      next: () => {
        this.successMsg = '✅ Layout generated successfully!';
        if (!this.venueType) {
           this.venueType = typeToGen;
        }
        this.loadSeats();
        this.loadStats();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Failed to generate layout.';
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  occupancyPercent(): number {
    if (!this.stats || !this.stats.totalSeats) return 0;
    return Math.round((this.stats.reservedSeats / this.stats.totalSeats) * 100);
  }

  trackById(_: number, item: EventSeat) { return item.id; }
}
