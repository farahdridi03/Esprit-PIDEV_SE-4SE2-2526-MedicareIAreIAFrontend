import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RecommendationItem {
  feature: string;
  currentValue: number;
  healthyBaseline: number;
  recommendation: string;
  category: string;
  priority: string;
  contributionScore: number;
}

export interface ClinicalRecommendationResponse {
  diagnosis: number;
  riskScore: number;
  riskLabel: string;
  riskColor: string;
  riskMessage: string;
  probRf: number;
  totalRecommendations: number;
  recommendations: RecommendationItem[];
  emailSent: boolean;
}

export interface ClinicalDataRequest {
  age: number;
  gender: number;
  ethnicity: number;
  educationLevel: number;
  bmi: number;
  smoking: number;
  alcoholConsumption: number;
  physicalActivity: number;
  dietQuality: number;
  sleepQuality: number;
  familyHistoryAlzheimers: number;
  cardiovascularDisease: number;
  diabetes: number;
  depression: number;
  headInjury: number;
  hypertension: number;
  systolicBP: number;
  diastolicBP: number;
  cholesterolTotal: number;
  cholesterolLDL: number;
  cholesterolHDL: number;
  cholesterolTriglycerides: number;
  mmse: number;
  functionalAssessment: number;
  adl: number;
  memoryComplaints: number;
  behavioralProblems: number;
  confusion: number;
  disorientation: number;
  personalityChanges: number;
  difficultyCompletingTasks: number;
  forgetfulness: number;
  doctorEmail?: string;
}

@Injectable({ providedIn: 'root' })
export class RecommendationService {

  private base = `${environment.apiUrl}/api/alzheimer`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  recommend(labResultId: number, data: ClinicalDataRequest): Observable<ClinicalRecommendationResponse> {
    return this.http.post<ClinicalRecommendationResponse>(
      `${this.base}/clinical-recommend/${labResultId}`,
      data,
      { headers: this.headers() }
    );
  }
}
