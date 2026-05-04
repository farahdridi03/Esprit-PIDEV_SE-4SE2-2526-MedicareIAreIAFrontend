import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-clinic-sidebar',
  templateUrl: './clinic-sidebar.component.html',
  styleUrls: ['./clinic-sidebar.component.scss']
})
export class ClinicSidebarComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
