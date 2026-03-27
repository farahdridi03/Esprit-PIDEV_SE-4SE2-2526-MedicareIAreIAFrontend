import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-home-care-sidebar',
    templateUrl: './home-care-sidebar.component.html',
    styleUrls: ['./home-care-sidebar.component.scss']
})
export class HomeCareSidebarComponent {
    constructor(private authService: AuthService) {}

    logout() {
        this.authService.logout();
    }
}
