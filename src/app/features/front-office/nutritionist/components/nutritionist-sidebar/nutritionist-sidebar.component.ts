import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-nutritionist-sidebar',
    templateUrl: './nutritionist-sidebar.component.html',
    styleUrls: ['./nutritionist-sidebar.component.scss']
})
export class NutritionistSidebarComponent {
    @Input() currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'overview';
    @Output() viewChange = new EventEmitter<'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients'>();

    constructor(private authService: AuthService) {}

    setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
        this.viewChange.emit(view);
    }

    logout() {
        this.authService.logout();
    }
}
