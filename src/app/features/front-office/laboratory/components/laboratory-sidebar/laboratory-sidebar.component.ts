import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';

@Component({
    selector: 'app-laboratorystaff-sidebar',
    templateUrl: './laboratory-sidebar.component.html',
    styleUrls: ['./laboratory-sidebar.component.scss']
})
export class LaboratoryStaffSidebarComponent implements OnInit {
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
