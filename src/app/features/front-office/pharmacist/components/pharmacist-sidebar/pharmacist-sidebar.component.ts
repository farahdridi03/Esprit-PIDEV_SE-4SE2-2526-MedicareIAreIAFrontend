import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';

@Component({
  selector: 'app-pharmacist-sidebar',
  templateUrl: './pharmacist-sidebar.component.html',
  styleUrls: ['./pharmacist-sidebar.component.scss']
})
export class PharmacistSidebarComponent implements OnInit {
  isCollapsed = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

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
}
