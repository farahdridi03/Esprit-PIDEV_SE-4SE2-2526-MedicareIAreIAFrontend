import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class PatientSidebarComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }

  canAccessForum(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.token) return false;
    
    // Les patients ne peuvent pas accéder au forum
    const patientRoles = ['PATIENT'];
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');
    
    return !patientRoles.includes(userRole);
  }
}
