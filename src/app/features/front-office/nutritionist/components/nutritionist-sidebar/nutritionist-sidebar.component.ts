import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';

@Component({
    selector: 'app-nutritionist-sidebar',
    templateUrl: './nutritionist-sidebar.component.html',
    styleUrls: ['./nutritionist-sidebar.component.scss']
})
export class NutritionistSidebarComponent implements OnInit {
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
