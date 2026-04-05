import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { LifestyleGoal, ProgressTracking } from '../../../../../models/lifestyle.model';

import { GoalCategory, GoalStatus } from '../../../../../models/lifestyle.model';

import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-lifestyle-form',
  templateUrl: './lifestyle-form.component.html',
  styleUrls: ['./lifestyle-form.component.scss']
})
export class LifestyleFormComponent implements OnInit {
  type: string = '';
  id: number | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  minDate: string = '';


  // Form Models
  goal: any = {
    category: GoalCategory.NUTRITION,
    targetValue: 0,
    baselineValue: 0,
    targetDate: '',
    status: GoalStatus.PENDING,
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


  goals: LifestyleGoal[] = []; // Available goals for tracking selection

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
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
    
    const userId = this.authService.getUserId();

    this.route.params.subscribe(params => {
      this.type = params['type'];
      const idParam = params['itemid'] || params['id'];
      const patientIdParam = params['id'];

      // Set defaults for NEW goal or NEW plan
      if (!this.router.url.includes('/edit/')) {
        this.isEditMode = false;
        if (this.type === 'goals') this.goal.targetDate = this.minDate;
        if (this.type === 'plans') this.plan.startDate = todayStr; // Allow today
      }


      if (this.router.url.includes('/nutritionist/')) {

        this.goal.patientId = +patientIdParam;
        this.tracking.patientId = +patientIdParam;
        if (this.type === 'plans') {
          this.plan.nutritionistId = userId;
        }
      } else {
        if (userId) {
          this.goal.patientId = userId;
          this.tracking.patientId = userId;
        }
      }

      if (idParam && this.router.url.includes('/edit/')) {
        this.id = +idParam;
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
    if (this.type === 'goals') {
      this.lifestyleService.getGoals().subscribe(goals => {
        const found = goals.find(g => g.id === this.id);
        if (found) {
          this.goal = { ...found };
          if (found.targetDate) {
            this.goal.targetDate = new Date(found.targetDate).toISOString().split('T')[0];
          }
        }
        this.isLoading = false;
      });
    } else if (this.type === 'tracking') {
      this.lifestyleService.getTrackings().subscribe(trackings => {
        const found = trackings.find(t => t.id === this.id);
        if (found) {
          this.tracking = { ...found };
          if (found.date) {
            this.tracking.date = new Date(found.date).toISOString().split('T')[0];
          }
        }
        this.isLoading = false;
      });
    } else if (this.type === 'plans') {
      this.lifestyleService.getPlanById(this.id).subscribe({
        next: (plan) => {
          this.plan = { ...plan };
          if (plan.startDate) this.plan.startDate = new Date(plan.startDate).toISOString().split('T')[0];
          if (plan.endDate) this.plan.endDate = new Date(plan.endDate).toISOString().split('T')[0];
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  onSubmit(): void {
    if (this.type === 'goals' && !this.isDateInFuture(this.goal.targetDate)) return;
    if (this.type === 'plans' && (!this.isTodayOrFuture(this.plan.startDate) || (this.plan.endDate && !this.isDateInFuture(this.plan.endDate)))) return;
    
    this.isLoading = true;



    if (this.type === 'goals') {
      const obs = this.isEditMode && this.id 
        ? this.lifestyleService.updateGoal(this.id, this.goal)
        : this.lifestyleService.addGoal(this.goal); // Corrected method name
      
      obs.subscribe({
        next: () => this.navigateBack(),
        error: () => this.isLoading = false
      });
    } else if (this.type === 'tracking') {
      const obs = this.isEditMode && this.id
        ? this.lifestyleService.updateTracking(this.id, this.tracking)
        : this.lifestyleService.addTracking(this.tracking); // Corrected method name
      
      obs.subscribe({
        next: () => this.navigateBack(),
        error: () => this.isLoading = false
      });
    } else if (this.type === 'plans') {
      const obs = this.isEditMode && this.id
        ? this.lifestyleService.updatePlan(this.id, this.plan)
        : this.lifestyleService.addPlan(this.plan);
      
      obs.subscribe({
        next: () => this.navigateBack(),
        error: () => this.isLoading = false
      });
    }
  }

  loadGoals(): void {
    const userId = this.authService.getUserId();
    const fetchObs = this.router.url.includes('/nutritionist/') && this.route.snapshot.params['id']
      ? this.lifestyleService.getGoalsByPatientId(+this.route.snapshot.params['id'])
      : this.lifestyleService.getGoals();

    fetchObs.subscribe(goals => {
      this.goals = goals;
    });
  }

  navigateBack(): void {
    const patientId = this.route.snapshot.params['id'];
    const url = this.router.url.includes('/nutritionist/')
      ? `/front/nutritionist/patient/${patientId}/lifestyle/${this.type}`
      : `/front/patient/lifestyle-wellness/${this.type}`;
    this.router.navigate([url]);
  }
}
