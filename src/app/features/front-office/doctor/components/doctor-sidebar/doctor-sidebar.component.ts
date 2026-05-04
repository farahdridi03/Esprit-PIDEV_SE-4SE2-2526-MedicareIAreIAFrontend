import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-doctor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.scss']
})
export class DoctorSidebarComponent {
  @Input() currentView: string = '';

  constructor(private authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
