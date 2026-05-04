import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-nutritionist-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './nutritionist-sidebar.component.html',
    styleUrls: ['./nutritionist-sidebar.component.scss']
})
export class NutritionistSidebarComponent {
    constructor(private authService: AuthService) {}

    logout() {
        this.authService.logout();
    }
}
