import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  firstName: string = 'User';

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    // Initial load from token
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.firstName = fullName.split(' ')[0];
    }
  }
}
