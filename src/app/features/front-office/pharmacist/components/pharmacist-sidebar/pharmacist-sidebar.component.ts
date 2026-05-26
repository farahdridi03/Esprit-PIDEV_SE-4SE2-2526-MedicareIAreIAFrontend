import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';

@Component({
    selector: 'app-pharmacist-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
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
