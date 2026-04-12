import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';

@Component({
  selector: 'app-doctor-sidebar',
  templateUrl: './doctor-sidebar.component.html',
  styleUrls: ['./doctor-sidebar.component.scss']
})
export class DoctorSidebarComponent implements OnInit {
  @Input() currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'calendar';
  @Output() viewChange = new EventEmitter<'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients'>();
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

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
    this.viewChange.emit(view);
  }

  logout() {
    this.authService.logout();
  }
}
