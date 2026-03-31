import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventRegistrationService } from '../../../../services/event-registration.service';
import { EventRegistration } from '../../../../models/event.model';

@Component({
  selector: 'app-event-registrations',
  templateUrl: './event-registrations.component.html',
  styleUrls: ['./event-registrations.component.scss']
})
export class EventRegistrationsComponent implements OnInit {
  eventId!: number;
  registrations: EventRegistration[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private registrationService: EventRegistrationService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventId = +id;
        this.loadRegistrations();
      }
    });
  }

  loadRegistrations() {
    this.loading = true;
    this.registrationService.getRegistrationsByEvent(this.eventId).subscribe({
      next: (res) => {
        this.registrations = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  validateRegistration(regId: number) {
    if (confirm('Are you sure you want to validate this registration?')) {
      this.loading = true;
      this.registrationService.validateRegistration(regId).subscribe({
        next: () => {
          this.loadRegistrations();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }
}