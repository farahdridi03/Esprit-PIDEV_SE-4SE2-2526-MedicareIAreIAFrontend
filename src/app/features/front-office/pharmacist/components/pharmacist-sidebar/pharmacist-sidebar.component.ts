import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pharmacist-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pharmacist-sidebar.component.html',
  styleUrls: ['./pharmacist-sidebar.component.scss']
})
export class PharmacistSidebarComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
