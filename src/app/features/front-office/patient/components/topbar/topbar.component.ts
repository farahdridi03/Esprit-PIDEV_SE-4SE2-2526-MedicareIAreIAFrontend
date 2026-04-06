import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class PatientTopbarComponent implements OnInit, OnDestroy {
  firstName: string = 'User';
  initials: string = 'U';
  photo: string | null = null;

  private profileSub?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    // 1. Immediately populate name from JWT — zero-delay, no flicker
    const nameFromToken = this.authService.getUserFullName();
    if (nameFromToken) {
      this.setNames(nameFromToken);
    }

    // 2. React to profile$ stream updates (name + photo)
    this.profileSub = this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) this.setNames(user.fullName);
        if (user.photo) this.photo = user.photo;
      }
    });

    // 3. Try the legacy /user/profile (falls back to JWT on 500)
    this.userService.refreshProfile();

    // 4. Load the patient profile — the only reliable source for the photo field
    this.patientService.getMe().subscribe({
      next: (patient) => {
        if (patient) {
          if (patient.fullName) this.setNames(patient.fullName);
          // Push photo into the shared profile$ stream so everyone gets it
          this.userService.setProfile({ photo: patient.photo ?? undefined });
          this.photo = patient.photo || null;
        }
      },
      error: () => { /* silently ignore — name is already set from JWT */ }
    });
  }

  ngOnDestroy() {
    this.profileSub?.unsubscribe();
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    this.firstName = parts[0];
    this.initials = parts.map(n => (n ? n[0] : '')).join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0]?.toUpperCase() || 'U';
  }
}
