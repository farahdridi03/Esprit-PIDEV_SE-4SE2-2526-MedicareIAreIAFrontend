import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  constructor(private router: Router) { }

  logout(): void {
    // Logic for logout
    this.router.navigate(['/front']);
  }
}
