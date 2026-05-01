import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-pharmacist-banner',
  template: `
    <div *ngIf="showPendingBanner" class="status-banner banner-pending">
      ⏳ Your pharmacy account is under review. You will be able to manage your products once an administrator approves your request.
    </div>
    <div *ngIf="showRejectedBanner" class="status-banner banner-rejected">
      ❌ Your pharmacy account request was rejected. Please contact support.
    </div>
  `,
  styles: [`
    .status-banner {
      width: 100%;
      padding: 12px 20px;
      text-align: center;
      font-weight: 500;
      color: #fff;
      position: sticky;
      top: 0;
      z-index: 990;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .banner-pending {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }
    .banner-rejected {
      background: linear-gradient(90deg, #ef4444, #b91c1c);
    }
  `]
})
export class PharmacistBannerComponent implements OnInit {
  showPendingBanner = false;
  showRejectedBanner = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.getUserRole() === 'PHARMACIST') {
      this.authService.pharmacistProfile$.subscribe(profile => {
        if (profile && profile.pharmacySetupCompleted) {
          if (profile.status === 'PENDING') {
            this.showPendingBanner = true;
            this.showRejectedBanner = false;
          } else if (profile.status === 'REJECTED') {
            this.showPendingBanner = false;
            this.showRejectedBanner = true;
          } else {
            this.showPendingBanner = false;
            this.showRejectedBanner = false;
          }
        }
      });
    }
  }
}
