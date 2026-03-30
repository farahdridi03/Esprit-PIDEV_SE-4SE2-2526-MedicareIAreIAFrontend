import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalEvent } from '../../../../../models/event.model';
import { EventService } from '../../../../../services/event.service';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event?: MedicalEvent;
  isParticipating: boolean = false;
  loading: boolean = true;
  submitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadEvent(id);
      this.checkParticipation(id);
    }
  }

  goBack(): void {
    // Navigate specifically to patient events portal (prefixed with /front/)
    this.router.navigate(['/front/patient/events']);
  }

  loadEvent(id: number): void {
    this.eventService.getPublicEventById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event detail', err);
        this.loading = false;
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
