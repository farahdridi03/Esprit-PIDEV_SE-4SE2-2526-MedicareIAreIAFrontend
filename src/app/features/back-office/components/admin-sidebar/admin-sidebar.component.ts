import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../../../services/sidebar.service';

@Component({
    selector: 'app-admin-sidebar',
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit {
    isCollapsed = false;

    constructor(
        private router: Router,
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
        this.router.navigate(['/front']);
    }

}
