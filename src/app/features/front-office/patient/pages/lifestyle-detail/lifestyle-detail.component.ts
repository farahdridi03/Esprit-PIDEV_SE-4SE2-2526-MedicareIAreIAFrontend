import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-lifestyle-detail',
  templateUrl: './lifestyle-detail.component.html',
  styleUrls: ['./lifestyle-detail.component.scss']
})
export class LifestyleDetailComponent implements OnInit {
  type: string = '';
  id: number | null = null;
  patientId: number | null = null;
  data: any = null;
  isLoading: boolean = true;
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
      this.id = params['itemid'] ? +params['itemid'] : null;
      this.patientId = params['id'] ? +params['id'] : null;
      this.loadData();
    });
  }

  loadData(): void {
    if (!this.id || isNaN(this.id)) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;

    let fetchObs: Observable<any> | null = null;
    if (this.type === 'plans') {
      fetchObs = this.lifestyleService.getPlanById(this.id);
    } else if (this.type === 'goals') {
      fetchObs = this.lifestyleService.getGoalById(this.id);
    } else if (this.type === 'tracking') {
      fetchObs = this.lifestyleService.getTrackingById(this.id);
    }

    if (fetchObs) {
      fetchObs.subscribe({
        next: (data: any) => {
          this.data = data;
          this.isLoading = false;
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error fetching details', err);
        }
      });
    }
  }

  goBack(): void {
    const url = this.patientId 
      ? `/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}`
      : `/front/patient/lifestyle-wellness/${this.type}`;
    this.router.navigate([url]);
  }

  onEdit(): void {
    if (!this.id) return;
    const basePath = this.patientId 
      ? `/front/nutritionist/patient/${this.patientId}/lifestyle/${this.type}` 
      : `/front/patient/lifestyle-wellness/${this.type}`;
    this.router.navigate([`${basePath}/edit/${this.id}`]);
  }
}
