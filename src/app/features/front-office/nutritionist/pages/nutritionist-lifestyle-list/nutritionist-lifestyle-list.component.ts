import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { LifestyleGoal, LifestylePlan, ProgressTracking } from '../../../../../models/lifestyle.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-nutritionist-lifestyle-list',
  templateUrl: './nutritionist-lifestyle-list.component.html',
  styleUrls: ['../../../patient/pages/lifestyle-list/lifestyle-list.component.scss']
})
export class NutritionistLifestyleListComponent implements OnInit {
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

    if (!fetchObs) {
      this.isLoading = false;
      return;
    }

    fetchObs.subscribe({
      next: (data: any[]) => {
        this.data = data;
        this.isLoading = false;
      },
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

  // Actions
  onCreate(): void {
    if (!this.patientId) return;
    this.router.navigate([`/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}/new`]);
  }

  onEdit(id: number | undefined): void {
    if (!id || !this.patientId) return;
    this.router.navigate([`/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}/edit/${id}`]);
  }

  onDelete(id: number | undefined): void {
    if (!id) return;
    if (confirm(`Are you sure you want to delete this ${this.type}?`)) {
      if (this.type === 'goals') {
        this.lifestyleService.deleteGoal(id).subscribe(() => this.loadData());
      } else if (this.type === 'tracking') {
        this.lifestyleService.deleteTracking(id).subscribe(() => this.loadData());
      } else if (this.type === 'plans') {
        this.lifestyleService.deletePlan(id).subscribe(() => this.loadData());
      }
    }
  }

  onView(id: number | undefined): void {
    if (!id || !this.patientId) return;
    this.router.navigate([`/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}/view/${id}`]);
  }

  canCreate(): boolean {
    return this.type === 'plans';
  }

  canEditDelete(): boolean {
    return this.type === 'plans';
  }

  getBackLink(): string {
    return `/front/nutritionist/patient/${this.patientId}`;
  }
}
