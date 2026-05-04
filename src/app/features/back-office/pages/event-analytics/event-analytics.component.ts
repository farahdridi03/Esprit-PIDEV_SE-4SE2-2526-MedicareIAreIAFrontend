import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { EventAnalytics } from '../../../../models/event.model';

@Component({
  selector: 'app-event-analytics',
  templateUrl: './event-analytics.component.html',
  styleUrls: ['./event-analytics.component.scss']
})
export class EventAnalyticsComponent implements OnInit {
  analytics?: EventAnalytics;
  loading = true;
  eventId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.eventId) {
      this.loadAnalytics();
    }
  }

  loadAnalytics() {
    this.loading = true;
    this.eventService.getEventAnalytics(this.eventId).subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading analytics', err);
        this.loading = false;
      }
    });
  }

  getSatisfactionColor(rating: number): string {
    if (rating >= 4) return '#22c55e';
    if (rating >= 3) return '#eab308';
    return '#ef4444';
  }
}
