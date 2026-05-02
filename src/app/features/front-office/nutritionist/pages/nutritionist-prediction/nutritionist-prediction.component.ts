import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PredictionService } from '../../../../../services/prediction.service';

@Component({
  selector: 'app-nutritionist-prediction',
  templateUrl: './nutritionist-prediction.component.html',
  styleUrls: ['./nutritionist-prediction.component.scss']
})
export class NutritionistPredictionComponent implements OnInit {
  patientId: number | null = null;
  isLoading: boolean = false;
  result: any = null;

  form: any = {
    age: null,
    gender: 0,
    bmi: null,
    smoking_status: 0,
    physical_activity: 0,
    cholesterol: null,
    glucose_level: null,
    heart_disease_risk: 0,
    diabetes_risk: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private predictionService: PredictionService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
    });
  }

  predict(): void {
    if (this.isFormInvalid()) return;

    this.isLoading = true;
    this.predictionService.predict(this.form).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Prediction error:', err);
        this.isLoading = false;
      }
    });
  }

  isFormInvalid(): boolean {
    return !this.form.age || !this.form.bmi || !this.form.cholesterol || !this.form.glucose_level;
  }

  navigateBack(): void {
    this.router.navigate([`/front/nutritionist/patient/${this.patientId}/lifestyle/plans/new`]);
  }

  usePlan(): void {
    if (!this.result) return;
    const recommendation = `Diet: ${this.result.diet_recommendation}\nExercise: ${this.result.exercise_recommendation}`;
    this.router.navigate([`/front/nutritionist/patient/${this.patientId}/lifestyle/plans/new`], {
      queryParams: { description: recommendation }
    });
  }
}
