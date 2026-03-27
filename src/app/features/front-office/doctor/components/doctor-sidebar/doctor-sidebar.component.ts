import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.scss']
})
export class DoctorSidebarComponent {
  @Input() currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'calendar';
  @Output() viewChange = new EventEmitter<'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients'>();

  constructor(private authService: AuthService) { }

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
    this.viewChange.emit(view);
  }

  logout() {
    this.authService.logout();
  }
}
