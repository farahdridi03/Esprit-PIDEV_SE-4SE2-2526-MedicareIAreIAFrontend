import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'app-admin-sidebar',
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent implements OnInit {
    firstName: string = 'Admin';
    initials: string = 'AD';
    userRole: string | null = null;

    constructor(private authService: AuthService, private userService: UserService) { }

    ngOnInit() {
        const rawRole = this.authService.getUserRole();
        this.userRole = rawRole ? rawRole.toUpperCase() : null;
        console.log('AdminSidebar Initialized. Role detected:', this.userRole);
        this.loadUserInfo();
        this.userService.getProfile().subscribe({
            next: (user) => {
                if (user && user.fullName) {
                    this.setNames(user.fullName);
                }
            }
        });
    }

    private loadUserInfo() {
        const fullName = this.authService.getUserFullName();
        if (fullName) {
            this.setNames(fullName);
        }
    }

    private setNames(fullName: string) {
        if (!fullName) return;
        const parts = fullName.split(' ');
        this.firstName = parts[0];
        this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
        if (!this.initials) this.initials = this.firstName[0].toUpperCase();
    }

    logout() {
        this.authService.logout();
    }
}
