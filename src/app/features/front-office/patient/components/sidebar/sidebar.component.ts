import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    this.sidebarService.isCollapsed$.subscribe(
      collapsed => this.isCollapsed = collapsed
    );
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout() {
    this.authService.logout();
  }

  canAccessForum(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.token) return false;

    const patientRoles = ['PATIENT'];
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');

    return !patientRoles.includes(userRole);
  }
}
