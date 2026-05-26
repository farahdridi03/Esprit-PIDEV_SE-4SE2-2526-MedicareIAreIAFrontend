import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { SidebarService } from '../../../../../services/sidebar.service';

@Component({
    selector: 'app-nutritionist-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './nutritionist-sidebar.component.html',
    styleUrls: ['./nutritionist-sidebar.component.scss']
})
export class NutritionistSidebarComponent implements OnInit {
    @Input() currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'overview';
    @Output() viewChange = new EventEmitter<'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients'>();
    
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

    setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
        this.viewChange.emit(view);
    }

    logout() {
        this.authService.logout();
    }
}
