import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { LifestyleGoal, GoalCategory, GoalStatus } from '../../../../../models/lifestyle.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-nutritionist-lifestyle-form',
  templateUrl: './nutritionist-lifestyle-form.component.html',
  styleUrls: ['../../../patient/pages/lifestyle-form/lifestyle-form.component.scss']
})
export class NutritionistLifestyleFormComponent implements OnInit {
  type: string = '';
  id: number | null = null;
  patientId: number | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  minDate: string = '';


  // Form Models
  goal: any = {
    category: 'WEIGHT_LOSS',
    targetValue: 0,
    baselineValue: 0,
    targetDate: '',
    status: 'PENDING',
    patientId: null
  };


  tracking: any = {
    goalId: null,
    date: new Date().toISOString().split('T')[0],
    value: 0,
    notes: '',
    patientId: null
  };

  plan: any = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    goalId: null,
    nutritionistId: null
  };


  goals: LifestyleGoal[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lifestyleService: LifestyleService,
    private authService: AuthService
  ) { }

  isTodayOrFuture(dateStr: string): boolean {
    if (!dateStr) return true;
    try {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0,0,0,0);
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return targetDate.getTime() >= today.getTime();
    } catch (e) {
      return false;
    }
  }

  isDateInFuture(dateStr: string): boolean {
    if (!dateStr) return true;
    try {
      const date = new Date(dateStr);
      const tomorrow = new Date();
      tomorrow.setHours(0,0,0,0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return targetDate.getTime() >= tomorrow.getTime();
    } catch (e) {
      return false;
    }
  }





  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const minDateStr = tomorrow.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    this.minDate = minDateStr;

    const userId = this.authService.getUserId();

    this.route.params.subscribe(params => {
      this.type = params['type'];
      this.patientId = +params['id'];
      const itemId = params['itemid'];

      // Set defaults for NEW goal or NEW plan
      if (!this.router.url.includes('/edit/')) {
        this.isEditMode = false;
        if (this.type === 'goals') this.goal.targetDate = this.minDate;
        if (this.type === 'plans') this.plan.startDate = todayStr; // Allow today
      }




      this.goal.patientId = this.patientId;
      this.tracking.patientId = this.patientId;
      this.plan.nutritionistId = userId;

      if (itemId && this.router.url.includes('/edit/')) {
        this.id = +itemId;
        this.isEditMode = true;
        this.loadData();
      }

      if (this.type === 'tracking' || this.type === 'plans') {
        this.loadGoals();
      }
    });
  }

  loadData(): void {
    if (!this.id) return;
    this.isLoading = true;
    if (this.type === 'plans') {
      this.lifestyleService.getPlanById(this.id).subscribe({
        next: (plan) => {
          this.plan = { ...plan };
          if (plan.startDate) this.plan.startDate = new Date(plan.startDate).toISOString().split('T')[0];
          if (plan.endDate) this.plan.endDate = new Date(plan.endDate).toISOString().split('T')[0];
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else if (this.type === 'goals') {
       this.lifestyleService.getGoalById(this.id).subscribe({
         next: (goal) => {
            this.goal = { ...goal };
            if (goal.targetDate) this.goal.targetDate = new Date(goal.targetDate).toISOString().split('T')[0];
            this.isLoading = false;
         },
         error: () => this.isLoading = false
       });
    } else if (this.type === 'tracking') {
       this.lifestyleService.getTrackingById(this.id).subscribe({
         next: (track) => {
            this.tracking = { ...track };
            if (track.date) this.tracking.date = new Date(track.date).toISOString().split('T')[0];
            this.isLoading = false;
         },
         error: () => this.isLoading = false
       });
    }
  }

  loadGoals(): void {
    if (!this.patientId) return;
    this.lifestyleService.getGoalsByPatientId(this.patientId).subscribe(goals => {
      this.goals = goals;
    });
  }

  onSubmit(): void {
    if (this.type === 'goals' && !this.isDateInFuture(this.goal.targetDate)) return;
    if (this.type === 'plans' && (!this.isTodayOrFuture(this.plan.startDate) || (this.plan.endDate && !this.isDateInFuture(this.plan.endDate)))) return;

    this.isLoading = true;


    let obs: Observable<any> | null = null;
    if (this.type === 'plans') {
      obs = this.isEditMode && this.id
        ? this.lifestyleService.updatePlan(this.id, this.plan)
        : this.lifestyleService.addPlan(this.plan);
    } else if (this.type === 'goals') {
       obs = this.isEditMode && this.id
        ? this.lifestyleService.updateGoal(this.id, this.goal)
        : this.lifestyleService.addGoal(this.goal);
    } else if (this.type === 'tracking') {
       obs = this.isEditMode && this.id
        ? this.lifestyleService.updateTracking(this.id, this.tracking)
        : this.lifestyleService.addTracking(this.tracking);
    }

    if (obs) {
      obs.subscribe({
        next: () => this.navigateBack(),
        error: () => this.isLoading = false
      });
    } else {
      this.isLoading = false;
    }
  }

  navigateBack(): void {
    this.router.navigate([`/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}`]);
  }
}
