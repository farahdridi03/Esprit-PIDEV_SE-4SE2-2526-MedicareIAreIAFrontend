import { Component } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-nutritionist-sidebar',
    templateUrl: './nutritionist-sidebar.component.html',
    styleUrls: ['./nutritionist-sidebar.component.scss']
})
export class NutritionistSidebarComponent {
    constructor(private authService: AuthService) {}

    logout() {
        this.authService.logout();
    }
}
