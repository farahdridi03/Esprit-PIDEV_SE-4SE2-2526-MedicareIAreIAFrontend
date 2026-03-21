import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-laboratorystaff-sidebar',
    templateUrl: './laboratory-sidebar.component.html',
    styleUrls: ['./laboratory-sidebar.component.scss']
})
export class LaboratoryStaffSidebarComponent {
    constructor(private authService: AuthService) {}

    logout() {
        this.authService.logout();
    }
}
