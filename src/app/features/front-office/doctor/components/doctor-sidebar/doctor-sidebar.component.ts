import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.scss']
})
export class DoctorSidebarComponent {
  @Input() currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' = 'calendar';
  @Output() viewChange = new EventEmitter<'overview' | 'settings' | 'exceptions' | 'calendar'>();

  constructor(private authService: AuthService) { }

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar') {
    this.viewChange.emit(view);
  }

  logout() {
    this.authService.logout();
  }
}
