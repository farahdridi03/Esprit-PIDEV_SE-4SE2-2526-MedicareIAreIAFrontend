import { Component } from '@angular/core';

@Component({
    selector: 'app-home-care-sidebar',
    templateUrl: './home-care-sidebar.component.html',
    styleUrls: ['./home-care-sidebar.component.scss']
})
export class HomeCareSidebarComponent {
    logout() {
        console.log('Logout clicked');
    }
}
