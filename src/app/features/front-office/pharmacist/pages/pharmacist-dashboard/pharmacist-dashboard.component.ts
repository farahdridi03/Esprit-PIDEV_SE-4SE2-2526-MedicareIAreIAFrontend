import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PharmacyOrderService } from '../../../../../services/pharmacy-order.service';
import { PharmacyStatsDTO } from '../../../../../models/pharmacy-order.model';

@Component({
  selector: 'app-pharmacist-dashboard',
  templateUrl: './pharmacist-dashboard.component.html',
  styleUrls: ['./pharmacist-dashboard.component.scss']
})
export class PharmacistDashboardComponent implements OnInit {
  fullName: string = '';
  pharmacyId: number | null = null;
  stats: PharmacyStatsDTO | null = null;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private orderService: PharmacyOrderService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user: UserProfile) => {
        if (user && user.fullName) this.fullName = user.fullName;
        if (user && user.pharmacyId) {
          this.pharmacyId = user.pharmacyId;
          this.loadStats();
        }
      },
      error: (err: any) => {
        console.error('Error fetching pharmacist profile', err);
      }
    });
  }

  loadStats(): void {
    if (!this.pharmacyId) return;
    this.orderService.getPharmacyStats(this.pharmacyId).subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error loading stats', err)
    });
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) this.fullName = fullName;
  }
}
