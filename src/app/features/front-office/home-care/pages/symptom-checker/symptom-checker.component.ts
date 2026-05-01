import { Component } from '@angular/core';
import { HomecareService } from '../../../../../services/homecare.service';
import { ServiceRecommendationDTO } from '../../../../../models/homecare.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-symptom-checker',
  templateUrl: './symptom-checker.component.html',
  styleUrls: ['./symptom-checker.component.scss']
})
export class SymptomCheckerComponent {

  symptoms = '';
  selectedLang: 'EN' | 'FR' | 'AR' = 'EN';
  isLoading = false;
  result: ServiceRecommendationDTO | null = null;
  errorMsg = '';

  placeholders = {
    EN: 'Describe your symptoms in detail... (e.g: I have severe knee pain and difficulty walking every morning)',
    FR: 'Décrivez vos symptômes en détail... (ex: J\'ai des douleurs au genou et des difficultés à marcher)',
    AR: 'صف أعراضك بالتفصيل... (مثال: عندي آلام شديدة في الركبة وصعوبة في المشي)'
  };

  serviceIcons: Record<string, string> = {
    'Physiotherapy'        : 'bi-person-walking',
    'Nursing Care'         : 'bi-heart-pulse',
    'Psychological Support': 'bi-brain',
    'Elderly Care'         : 'bi-house-heart',
    'Post-Surgery Care'    : 'bi-bandaid',
    'Pediatric Care'       : 'bi-emoji-smile',
  };

  serviceColors: Record<string, string> = {
    'Physiotherapy'        : '#4f46e5',
    'Nursing Care'         : '#10b981',
    'Psychological Support': '#8b5cf6',
    'Elderly Care'         : '#f59e0b',
    'Post-Surgery Care'    : '#ef4444',
    'Pediatric Care'       : '#06b6d4',
  };

  constructor(private homecareService: HomecareService, private router: Router) {}

  get placeholder(): string {
    return this.placeholders[this.selectedLang];
  }

  get isRtl(): boolean {
    return this.selectedLang === 'AR';
  }

  get serviceColor(): string {
    return this.result ? (this.serviceColors[this.result.recommendedService] || '#0e7c66') : '#0e7c66';
  }

  get serviceIcon(): string {
    return this.result ? (this.serviceIcons[this.result.recommendedService] || 'bi-heart-pulse') : 'bi-heart-pulse';
  }

  get confidencePercent(): number {
    return this.result ? Math.round(this.result.confidence * 100) : 0;
  }

  analyze() {
    if (!this.symptoms.trim() || this.symptoms.trim().length < 5) return;
    this.isLoading = true;
    this.result = null;
    this.errorMsg = '';

    this.homecareService.recommendService(this.symptoms).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Service temporarily unavailable. Please try again.';
        this.isLoading = false;
      }
    });
  }

  bookService() {
    this.router.navigate(['/front/home-care/dashboard']);
  }

  reset() {
    this.symptoms = '';
    this.result = null;
    this.errorMsg = '';
  }
}
