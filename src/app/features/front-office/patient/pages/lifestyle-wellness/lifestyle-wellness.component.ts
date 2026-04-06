import { Component, OnInit } from '@angular/core';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { AuthService } from '../../../../../services/auth.service';
import { PatientService } from '../../../../../services/patient.service';
import { LifestyleGoal, LifestylePlan, ProgressTracking } from '../../../../../models/lifestyle.model';
import { PatientResponseDTO } from '../../../../../models/patient.model';

@Component({
  selector: 'app-lifestyle-wellness',
  templateUrl: './lifestyle-wellness.component.html',
  styleUrls: ['./lifestyle-wellness.component.scss']
})
export class LifestyleWellnessComponent implements OnInit {
  userName: string = 'User';
  userId: number | null = null;

  recentGoals: LifestyleGoal[] = [];
  recentPlans: LifestylePlan[] = [];
  recentTrackings: ProgressTracking[] = [];
  patient: PatientResponseDTO | null = null;


  isLoading: boolean = true;

  constructor(
    private lifestyleService: LifestyleService,
    private authService: AuthService,
    private patientService: PatientService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserFullName() || 'User';
    this.userId = this.authService.getUserId();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.patientService.getMe().subscribe({
      next: (profile) => {
        this.patient = profile;
        console.log('DEBUG: Patient profile loaded in lifestyle-wellness:', this.patient);
        
        const patientId = this.patient?.id;
        if (patientId) {
          this.loadPatientLifestyleData(patientId);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private loadPatientLifestyleData(patientId: number): void {
    this.lifestyleService.getGoalsByPatientId(patientId).subscribe({
      next: (goals) => {
        this.recentGoals = (goals ?? []).slice(0, 3);
      },
      error: () => this.checkLoading(),
      complete: () => this.checkLoading()
    });

    this.lifestyleService.getPlansByPatientId(patientId).subscribe({
      next: (plans) => {
        this.recentPlans = (plans ?? []).slice(0, 3);
      },
      error: () => this.checkLoading(),
      complete: () => this.checkLoading()
    });

    this.lifestyleService.getTrackingsByPatientId(patientId).subscribe({
      next: (trackings) => {
        this.recentTrackings = (trackings ?? []).slice(0, 3);
      },
      error: () => this.checkLoading(),
      complete: () => this.checkLoading()
    });
  }

  private checkLoading(): void {
    // Simple logic to stop loading spinner once all calls complete (or use forkJoin)
    // For now, simple enough
    this.isLoading = false; 
  }

  // Placeholder actions
  onViewAll(type: string): void {
    console.log(`View all ${type}`);
  }

  onCreate(type: string): void {
    console.log(`Create new ${type}`);
  }

  onEdit(id: number | undefined, type: string): void {
    console.log(`Edit ${type} with id ${id}`);
  }

  onDelete(id: number | undefined, type: string): void {
    if (!id) return;
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'goal') {
        this.lifestyleService.deleteGoal(id).subscribe(() => this.loadData());
      } else if (type === 'tracking') {
        this.lifestyleService.deleteTracking(id).subscribe(() => this.loadData());
      }
    }
  }

  onView(id: number | undefined, type: string): void {
    console.log(`View ${type} with id ${id}`);
  }
}
