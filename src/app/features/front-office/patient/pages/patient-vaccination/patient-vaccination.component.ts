import { Component, OnInit } from '@angular/core';
import { BabyCareService, BabyDashboard } from '../../../../../services/baby-care.service';
import { AuthService } from '../../../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patient-vaccination',
  templateUrl: './patient-vaccination.component.html',
  styleUrls: ['./patient-vaccination.component.scss']
})
export class PatientVaccinationComponent implements OnInit {
  isLoading = true;
  baby: BabyDashboard | null = null;
  vaccineOverview: any = null;
  
  constructor(
    private babyService: BabyCareService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.babyService.getProfileByPatientId(userId).subscribe({
      next: (profile) => {
        this.babyService.getDashboard(profile.id).subscribe(dash => {
          this.baby = dash;
          this.loadVaccines(profile.id);
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadVaccines(babyId: number) {
    this.babyService.getVaccines(babyId).subscribe({
      next: (data) => {
        this.vaccineOverview = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  markAsDone(vaccineId: number) {
    if (!this.baby) return;
    // We use ID now as the backend supports it better
    this.babyService.markVaccineDoneById(this.baby.id, vaccineId).subscribe(() => {
      this.loadVaccines(this.baby!.id);
    });
  }

  downloadBooklet() {
    if (!this.baby) return;
    const url = `http://localhost:8081/springsecurity/api/vaccines/booklet/${this.baby.id}`;
    window.open(url, '_blank');
  }

  getDaysRemaining(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
