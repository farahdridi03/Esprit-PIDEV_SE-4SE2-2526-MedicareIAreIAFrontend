import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-laboratorystaff-dashboard',
    templateUrl: './laboratory-dashboard.component.html',
    styleUrls: ['./laboratory-dashboard.component.scss']
})
export class LaboratoryStaffDashboardComponent implements OnInit {

  private readonly API = 'http://localhost:8081/springsecurity/api/lab-narrator';

  firstName         = 'Staff';
  pendingCount      = 0;
  narratorLoading   = false;
  showHistoryModal  = false;
  narratorHistory: any[] = [];

  get isDashboard(): boolean {
    return this.router.url.endsWith('/dashboard') || this.router.url.includes('/dashboard?');
  }

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const fullName = this.authService.getUserFullName();
    if (fullName) this.firstName = fullName.split(' ')[0];

    this.userService.getProfile().subscribe({
      next: (user) => { if (user?.fullName) this.firstName = user.fullName.split(' ')[0]; },
      error: (err)  => console.error('Profile error', err)
    });

    this.loadPendingCount();
  }

  loadPendingCount() {
    this.http.get<any>(this.API + '/pending').subscribe({
      next: (res) => this.pendingCount = res.count ?? 0,
      error: ()   => this.pendingCount = 0
    });
  }

  generateNarratives() {
    this.narratorLoading = true;
    this.http.get<any>(this.API + '/pending').subscribe({
      next: (res) => {
        const results: any[] = res.results ?? [];
        if (results.length === 0) {
          this.narratorLoading = false;
          this.pendingCount = 0;
          return;
        }
        let done = 0;
        results.forEach(r => {
          this.http.post(this.API + '/generate/' + r.id, {}).subscribe({
            next: () => {
              done++;
              if (done === results.length) {
                this.narratorLoading = false;
                this.pendingCount = 0;
                this.openHistoryModal();
              }
            },
            error: () => {
              done++;
              if (done === results.length) {
                this.narratorLoading = false;
                this.openHistoryModal();
              }
            }
          });
        });
      },
      error: () => this.narratorLoading = false
    });
  }

  openHistoryModal() {
    this.http.get<any[]>(this.API + '/history').subscribe({
      next: (data) => { this.narratorHistory = data; this.showHistoryModal = true; },
      error: ()    => { this.narratorHistory = [];   this.showHistoryModal = true; }
    });
  }

  regenerate(item: any) {
    item.regenerating = true;
    this.http.post<any>(this.API + '/regenerate/' + item.id, {}).subscribe({
      next: (res) => {
        item.doctorNarrative  = res.doctorNarrative;
        item.patientNarrative = res.patientNarrative;
        item.regenerating     = false;
      },
      error: () => { item.regenerating = false; }
    });
  }
}
