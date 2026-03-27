import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../../services/event.service';
import { EventRegistrationService } from '../../../../../services/event-registration.service';
import { MedicalEvent, EventRegistration } from '../../../../../models/event.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  eventId!: number;
  event: MedicalEvent | null = null;
  loading = false;
  registering = false;

  userId!: number;
  userRegistration: EventRegistration | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private regService: EventRegistrationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventId = +id;
        this.loadEvent();
        this.checkRegistrationStatus();
      }
    });
  }

  loadEvent() {
    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (res) => {
        this.event = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  checkRegistrationStatus() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      this.userId = u.id;

      if (this.userId) {
        this.regService.getRegistrationsByParticipant(this.userId).subscribe({
          next: (regs) => {
            const myReg = regs.find(r => r.eventId === this.eventId);
            if (myReg) {
              this.userRegistration = myReg;
            }
          }
        });
      }
    } else {
       // Not logged in properly, can't register
    }
  }

  register() {
    if (!this.userId) {
      alert('Please log in to register.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.userRegistration) return;

    this.registering = true;
    this.regService.registerToEvent({
      eventId: this.eventId,
      participantId: this.userId
    }).subscribe({
      next: (reg) => {
        this.userRegistration = reg;
        this.registering = false;
        alert('Successfully registered for the event!');
      },
      error: (err) => {
        console.error(err);
        // Fallback warning if backend detects duplicate
        if (err.error?.message?.includes('already')) {
           alert('You are already registered for this event.');
        } else {
           alert('Registration failed. Please try again.');
        }
        this.registering = false;
      }
    });
  }
}
