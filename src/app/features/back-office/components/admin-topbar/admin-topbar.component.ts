import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-admin-topbar',
    templateUrl: './admin-topbar.component.html',
    styleUrls: ['./admin-topbar.component.scss']
})
export class AdminTopbarComponent implements OnInit {
    firstName: string = 'Admin';
    initials: string = 'AD';

    constructor(private userService: UserService, private authService: AuthService) { }

    ngOnInit() {
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
}
