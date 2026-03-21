import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-pharmacist-sidebar',
  templateUrl: './pharmacist-sidebar.component.html',
  styleUrls: ['./pharmacist-sidebar.component.scss']
})
export class PharmacistSidebarComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
