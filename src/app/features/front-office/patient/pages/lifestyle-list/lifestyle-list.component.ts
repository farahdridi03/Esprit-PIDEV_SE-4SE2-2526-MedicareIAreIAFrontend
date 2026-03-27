import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { LifestyleGoal, LifestylePlan, ProgressTracking } from '../../../../../models/lifestyle.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-lifestyle-list',
  templateUrl: './lifestyle-list.component.html',
  styleUrls: ['./lifestyle-list.component.scss']
})
export class LifestyleListComponent implements OnInit {
  type: string = '';
  title: string = '';
  data: any[] = [];
  isLoading: boolean = true;
  patientId: number | null = null;
  userRole: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lifestyleService: LifestyleService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.route.params.subscribe(params => {
      this.type = params['type'];
      this.patientId = params['id'] ? +params['id'] : null;
      this.setMetadata();
      this.loadData();
    });
  }

  setMetadata(): void {
    switch (this.type) {
      case 'goals':
        this.title = 'Lifestyle Goals';
        break;
      case 'plans':
        this.title = 'Lifestyle Plans';
        break;
      case 'tracking':
        this.title = 'Progress Tracking History';
        break;

      default:
        this.title = 'Lifestyle & Wellness';
    }
  }

  loadData(): void {
    this.isLoading = true;
    const fetchObs = this.patientId 
      ? this.getPatientSpecificData() 
      : this.getMyData();

    fetchObs.subscribe({
      next: (data: any[]) => this.handleSuccess(data),
      error: (err: any) => this.isLoading = false
    });
  }

  private getMyData(): any {
    switch (this.type) {
      case 'goals': return this.lifestyleService.getGoals();
      case 'plans': return this.lifestyleService.getPlans();
      case 'tracking': return this.lifestyleService.getTrackings();
      default: return null;
    }
  }

  private getPatientSpecificData(): any {
    if (!this.patientId) return null;
    switch (this.type) {
      case 'goals': return this.lifestyleService.getGoalsByPatientId(this.patientId);
      case 'plans': return this.lifestyleService.getPlansByPatientId(this.patientId);
      case 'tracking': return this.lifestyleService.getTrackingsByPatientId(this.patientId);
      default: return null;
    }
  }

  handleSuccess(data: any[]): void {
    this.data = data;
    this.isLoading = false;
  }

  // Actions
  onCreate(): void {
    const basePath = this.patientId 
      ? `/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}` 
      : `/front/patient/lifestyle-wellness/${this.type}`;
    this.router.navigate([`${basePath}/new`]);
  }

  onEdit(id: number | undefined): void {
    if (!id) return;
    const basePath = this.patientId 
      ? `/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}` 
      : `/front/patient/lifestyle-wellness/${this.type}`;
    this.router.navigate([`${basePath}/edit/${id}`]);
  }

  onDelete(id: number | undefined): void {
    if (!id) return;
    if (confirm(`Are you sure you want to delete this ${this.type}?`)) {
      if (this.type === 'goals') {
        this.lifestyleService.deleteGoal(id).subscribe(() => this.loadData());
      } else if (this.type === 'tracking') {
        this.lifestyleService.deleteTracking(id).subscribe(() => this.loadData());
      }
    }
  }

  onView(id: number | undefined): void {
    if (!id) return;
    const basePath = this.patientId 
      ? `/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}` 
      : `/front/patient/lifestyle-wellness/${this.type}`;
    this.router.navigate([`${basePath}/view/${id}`]);
  }

  canCreate(): boolean {
    if (this.userRole === 'NUTRITIONIST') {
      return this.type === 'plans';
    }
    return this.type === 'goals' || this.type === 'tracking';
  }

  canView(id: number | undefined): boolean {
    return true; // Everyone can view
  }

  canEditDelete(): boolean {
    if (this.userRole === 'NUTRITIONIST') {
      return this.type === 'plans';
    }
    return this.type === 'goals' || this.type === 'tracking';
  }

  getBackLink(): string {
    return this.patientId 
      ? `/front/nutritionist/patient/${this.patientId}` 
      : '/front/patient/lifestyle-wellness';
  }
}
