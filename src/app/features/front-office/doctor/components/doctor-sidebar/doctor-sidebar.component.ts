import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.scss']
})
export class DoctorSidebarComponent {

  constructor(private router: Router) { }

  logout() {
    // Clear tokens/session here
    this.router.navigate(['/auth/login']);
  }

}
