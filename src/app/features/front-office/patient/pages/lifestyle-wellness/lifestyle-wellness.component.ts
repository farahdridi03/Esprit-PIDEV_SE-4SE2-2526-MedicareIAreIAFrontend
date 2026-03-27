import { Component, OnInit } from '@angular/core';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { AuthService } from '../../../../../services/auth.service';
import { LifestyleGoal, LifestylePlan, ProgressTracking } from '../../../../../models/lifestyle.model';

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


  isLoading: boolean = true;

  constructor(
    private lifestyleService: LifestyleService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserFullName() || 'User';
    this.userId = this.authService.getUserId();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    // In a real scenario, we'd filter by userId if the backend doesn't handle it via token
    this.lifestyleService.getGoals().subscribe({
      next: (goals) => {
        this.recentGoals = goals.slice(0, 3);
      },
      complete: () => this.checkLoading()
    });

    this.lifestyleService.getPlans().subscribe({
      next: (plans) => {
        this.recentPlans = plans.slice(0, 3);
      },
      complete: () => this.checkLoading()
    });

    this.lifestyleService.getTrackings().subscribe({
      next: (trackings) => {
        this.recentTrackings = trackings.slice(0, 3);
      },
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
