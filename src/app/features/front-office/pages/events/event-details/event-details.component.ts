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
