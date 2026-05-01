import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { EventSeat, SeatZoneSummary, SaveSeatRequest } from '../../../../models/event.model';

@Component({
  selector: 'app-event-seat-editor',
  templateUrl: './event-seat-editor.component.html',
  styleUrls: ['./event-seat-editor.component.scss']
})
export class EventSeatEditorComponent implements OnInit {
  eventId!: number;
  seats: EventSeat[] = [];
  summaries: SeatZoneSummary[] = [];
  
  // Drag state
  draggedSeat: EventSeat | null = null;
  offsetX: number = 0;
  offsetY: number = 0;

  // New Seat config
  newZoneName: string = 'Zone A';
  newSeatLabel: string = '';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSeats();
  }

  loadSeats() {
    this.eventService.getEventSeats(this.eventId).subscribe(res => {
      this.seats = res;
    });
    this.eventService.getEventSeatSummary(this.eventId).subscribe(res => {
      this.summaries = res;
    });
  }

  addSeat() {
    if (!this.newSeatLabel) return;
    const newSeat: EventSeat = {
      id: 0, // Temporary
      eventId: this.eventId,
      zoneName: this.newZoneName,
      seatLabel: this.newSeatLabel,
      posX: 50,
      posY: 50,
      status: 'AVAILABLE'
    };
    this.seats.push(newSeat);
    this.newSeatLabel = '';
  }

  saveMap() {
    const requests: SaveSeatRequest[] = this.seats.map(s => ({
      id: s.id === 0 ? undefined : s.id,
      zoneName: s.zoneName,
      seatLabel: s.seatLabel,
      posX: s.posX,
      posY: s.posY,
      status: s.status
    }));

    this.eventService.saveSeatsBatch(this.eventId, requests).subscribe({
      next: () => {
        alert('Seat Plan Saved!');
        this.loadSeats();
      },
      error: (err) => console.error(err)
    });
  }

  onMouseDown(event: MouseEvent, seat: EventSeat) {
    this.draggedSeat = seat;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.offsetX = event.clientX - rect.left;
    this.offsetY = event.clientY - rect.top;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.draggedSeat) {
      // Calculate relative position to the container (which we assume starts somewhere, simple logic here relative to page)
      // For absolute generic dragging, usually we bind to the container box. Here, we'll keep it simple CSS absolute 
      const container = document.getElementById('seat-map-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        let x = event.clientX - rect.left - this.offsetX;
        let y = event.clientY - rect.top - this.offsetY;
        
        // Bounds
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > rect.width - 40) x = rect.width - 40;
        if (y > rect.height - 40) y = rect.height - 40;

        this.draggedSeat.posX = x;
        this.draggedSeat.posY = y;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.draggedSeat = null;
  }

  deleteSeat(seat: EventSeat) {
    this.seats = this.seats.filter(s => s !== seat);
  }
}
