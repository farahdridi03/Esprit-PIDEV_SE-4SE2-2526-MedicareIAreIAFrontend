import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';

@Component({
    selector: 'app-clinic-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './clinic-sidebar.component.html',
    styleUrls: ['./clinic-sidebar.component.scss']
})
export class ClinicSidebarComponent implements OnInit {
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
