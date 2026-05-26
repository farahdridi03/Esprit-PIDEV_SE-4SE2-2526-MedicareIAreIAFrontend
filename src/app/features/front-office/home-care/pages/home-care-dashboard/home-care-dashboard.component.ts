import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { HomecareService } from '../../../../../services/homecare.service';
import { ServiceRequest } from '../../../../../models/homecare.model';

@Component({
    selector: 'app-home-care-dashboard',
    templateUrl: './home-care-dashboard.component.html',
    styleUrls: ['./home-care-dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HomeCareDashboardComponent implements OnInit {
  firstName: string = 'Provider';
  initials: string = 'H';
  
  // Stats
  stats = {
    todayVisits: 0,
    activePatients: 0,
    pendingRequests: 0,
    totalCompleted: 0
  };
  
  nextRequest?: ServiceRequest;
  recentRequests: ServiceRequest[] = [];
  isLoading = true;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private homecare: HomecareService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadDashboardData();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err) => {
        console.error('Error fetching home care provider profile', err);
      }
    });
  }

  private loadDashboardData() {
    this.isLoading = true;
    this.homecare.getProviderRequests().subscribe({
      next: (requests) => {
        this.processRequests(requests);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.isLoading = false;
      }
    });
  }

  private processRequests(requests: ServiceRequest[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Stats
    this.stats.todayVisits = requests.filter(r => r.requestedDateTime?.startsWith(todayStr) && (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS')).length;
    this.stats.pendingRequests = requests.filter(r => r.status === 'PENDING').length;
    this.stats.activePatients = new Set(requests.map(r => r.patient?.email).filter(e => !!e)).size;
    this.stats.totalCompleted = requests.filter(r => r.status === 'COMPLETED').length;

    // 2. Next Request (First accepted request from today onwards)
    this.nextRequest = requests
      .filter(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS')
      .sort((a, b) => new Date(a.requestedDateTime).getTime() - new Date(b.requestedDateTime).getTime())[0];

    // 3. Recent (Top 5)
    this.recentRequests = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.setNames(fullName);
    }
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}
