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
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

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
      this.showToast('Please log in to register.', 'error');
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);
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
        this.showToast('Successfully registered for the event!', 'success');
      },
      error: (err) => {
        console.error(err);
        if (err.error?.message?.includes('already')) {
           this.showToast('You are already registered for this event.', 'error');
        } else {
           this.showToast('Registration failed. Please try again.', 'error');
        }
        this.registering = false;
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }
}
