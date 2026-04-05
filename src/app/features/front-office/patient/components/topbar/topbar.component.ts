import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class PatientTopbarComponent implements OnInit {
  firstName: string = 'User';
  initials: string = 'U';
  photo: string | null = null;

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  private loadUserInfo() {
    this.userService.profile$.subscribe(user => {
      if (user) {
        if (user.fullName) {
          this.setNames(user.fullName);
        }
        this.photo = (user as any).photo || null;
      }
    });
    // Trigger initial load if not already loaded
    this.userService.refreshProfile();
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
