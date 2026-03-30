import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { ConsultationService } from '../../../../../services/consultation.service';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { forkJoin, catchError, of } from 'rxjs';

@Component({
    selector: 'app-nutritionist-dashboard',
    templateUrl: './nutritionist-dashboard.component.html',
    styleUrls: ['./nutritionist-dashboard.component.scss']
})
export class NutritionistDashboardComponent implements OnInit {
  currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'overview';
  firstName: string = 'Nutritionist';
  initials: string = 'N';

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
    this.currentView = view;
  }
  
  totalPatients: number = 0;
  totalConsultations: number = 0;
  totalMealPlans: number = 0;

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private patientService: PatientService,
    private consultationService: ConsultationService,
    private lifestyleService: LifestyleService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadStats();
    
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          this.setNames(user.fullName);
        }
      },
      error: (err) => {
        console.error('Error fetching nutritionist profile', err);
      }
    });
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      this.setNames(fullName);
    }
  }

  private loadStats() {
    forkJoin({
      patients: this.patientService.getAll().pipe(catchError(() => of([]))),
      consultations: this.consultationService.getAll().pipe(catchError(() => of([]))),
      planCount: this.lifestyleService.getPlanCount().pipe(catchError(() => of(0)))
    }).subscribe({
      next: (res) => {
        this.totalPatients = res.patients.length;
        this.totalConsultations = res.consultations.length;
        this.totalMealPlans = res.planCount;
      },
      error: (err) => {
        console.error('Error loading dashboard stats', err);
      }
    });
  }

  private setNames(fullName: string) {
    if (!fullName) return;
    const parts = fullName.split(' ');
    this.firstName = parts[0];
    this.initials = parts.map(n => n ? n[0] : '').join('').toUpperCase();
    if (!this.initials) this.initials = this.firstName[0].toUpperCase();
  }
}


