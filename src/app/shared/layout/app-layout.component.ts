import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {
  isPharmacist: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isPharmacist = role === 'PHARMACIST';
    this.isAdmin = role === 'ADMIN';
    console.log('BackOffice Layout Initialized', { role });
  }

}
