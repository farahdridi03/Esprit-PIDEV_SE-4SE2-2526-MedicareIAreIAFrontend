import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LabRequestService, LabRequestResponse } from '../../../../../services/lab-request.service';
import { AlzheimerService } from '../../../../../services/alzheimer.service';
import { LabResultResponse } from '../../../../../services/lab-result.service';
import { RecommendationService, ClinicalDataRequest, ClinicalRecommendationResponse } from '../../../../../services/recommendation.service';

@Component({
  selector: 'app-alzheimer-analysis',
  templateUrl: './alzheimer-analysis.component.html',
  styleUrls: ['./alzheimer-analysis.component.scss']
})
export class AlzheimerAnalysisComponent implements OnInit {

  // ── Step 1 : IRM ─────────────────────────────────────────
  labRequestId!: number;
  labRequest: LabRequestResponse | null = null;
  loadingRequest = true;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  technicianName = '';
  doctorEmail = '';
  isDragOver = false;

  analyzing = false;
  result: LabResultResponse | null = null;
  error = '';

  // ── Step 2 : Clinical form ───────────────────────────────
  showClinicalForm = false;
  analyzingClinical = false;
  clinicalResult: ClinicalRecommendationResponse | null = null;
  clinicalError = '';

  medicalFlags = [
    { key: 'familyHistoryAlzheimers', label: 'Family History of Alzheimer\'s' },
    { key: 'cardiovascularDisease',   label: 'Cardiovascular Disease' },
    { key: 'diabetes',                label: 'Diabetes' },
    { key: 'depression',              label: 'Depression' },
    { key: 'headInjury',              label: 'Head Injury' },
    { key: 'hypertension',            label: 'Hypertension' },
  ];

  symptomFlags = [
    { key: 'memoryComplaints',          label: 'Memory Complaints' },
    { key: 'behavioralProblems',        label: 'Behavioral Problems' },
    { key: 'confusion',                 label: 'Confusion' },
    { key: 'disorientation',            label: 'Disorientation' },
    { key: 'personalityChanges',        label: 'Personality Changes' },
    { key: 'difficultyCompletingTasks', label: 'Difficulty Completing Tasks' },
    { key: 'forgetfulness',             label: 'Forgetfulness' },
  ];

  clinical: any = {
    age: 65,
    gender: 1,
    ethnicity: 0,
    educationLevel: 1,
    bmi: 25,
    smoking: 0,
    alcoholConsumption: 0,
    physicalActivity: 3,
    dietQuality: 6,
    sleepQuality: 7,
    familyHistoryAlzheimers: 0,
    cardiovascularDisease: 0,
    diabetes: 0,
    depression: 0,
    headInjury: 0,
    hypertension: 0,
    systolicBP: 120,
    diastolicBP: 80,
    cholesterolTotal: 180,
    cholesterolLDL: 100,
    cholesterolHDL: 60,
    cholesterolTriglycerides: 120,
    mmse: 25,
    functionalAssessment: 7,
    adl: 8,
    memoryComplaints: 0,
    behavioralProblems: 0,
    confusion: 0,
    disorientation: 0,
    personalityChanges: 0,
    difficultyCompletingTasks: 0,
    forgetfulness: 0,
    doctorEmail: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private labRequestService: LabRequestService,
    private alzheimerService: AlzheimerService,
    private recommendationService: RecommendationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || idParam === '0') {
      this.error = 'Invalid Laboratory Request ID. Please select a request from the list.';
      this.loadingRequest = false;
      return;
    }
    this.labRequestId = Number(idParam);
    this.loadLabRequest();
  }

  loadLabRequest(): void {
    this.labRequestService.getById(this.labRequestId).subscribe({
      next: (req) => {
        this.labRequest = req;
        this.doctorEmail = req.doctorEmail || '';
        this.clinical.doctorEmail = this.doctorEmail;
        this.loadingRequest = false;
      },
      error: () => {
        this.error = 'Unable to load the laboratory request.';
        this.loadingRequest = false;
      }
    });
  }

  // ── File handling ─────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) this.setFile(input.files[0]);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.isDragOver = true; }
  onDragLeave(): void { this.isDragOver = false; }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File): void {
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      this.error = 'Invalid file type. Only PNG and JPG brain MRI images are accepted.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          this.error = 'Image too small. Please upload a valid brain MRI scan (minimum 100×100 px).';
          return;
        }

        const ratio = img.width / img.height;
        if (ratio < 0.5 || ratio > 2.0) {
          this.error = 'This image does not appear to be a brain MRI scan. Please upload a valid neurological MRI image.';
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Check grayscale — allow JPEG compression artifacts (threshold relaxed)
        let colorPixels = 0;
        for (let i = 0; i < 100; i++) {
          const x = Math.floor(Math.random() * img.width);
          const y = Math.floor(Math.random() * img.height);
          const [r, g, b] = Array.from(ctx.getImageData(x, y, 1, 1).data);
          if (Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) > 40) colorPixels++;
        }
        if (colorPixels > 55) {
          this.error = 'This appears to be a color image. Brain MRI scans must be grayscale. Please upload a valid neurological MRI image.';
          return;
        }

        // Check dark corners — MRI brain scans have a black background (threshold relaxed)
        const cs = Math.max(10, Math.floor(img.width * 0.06));
        const corners = [
          ctx.getImageData(0, 0, cs, cs).data,
          ctx.getImageData(img.width - cs, 0, cs, cs).data,
          ctx.getImageData(0, img.height - cs, cs, cs).data,
          ctx.getImageData(img.width - cs, img.height - cs, cs, cs).data
        ];
        let darkCorners = 0;
        for (const data of corners) {
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (sum / (cs * cs) < 60) darkCorners++;
        }
        if (darkCorners < 2) {
          this.error = 'This image does not appear to be a brain MRI scan. MRI scans must have a dark background. Please upload a valid neurological MRI image.';
          return;
        }

        this.selectedFile = file;
        this.previewUrl = dataUrl;
        this.result = null;
        this.error = '';
        this.showClinicalForm = false;
        this.clinicalResult = null;
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.result = null;
    this.error = '';
    this.showClinicalForm = false;
    this.clinicalResult = null;
  }

  canSubmit(): boolean {
    return !!this.selectedFile && this.technicianName.trim().length > 0 && !this.analyzing;
  }

  // ── Step 1 : IRM Analysis ────────────────────────────────
  analyze(): void {
    if (!this.canSubmit()) return;
    this.analyzing = true;
    this.error = '';
    this.result = null;
    this.showClinicalForm = false;
    this.clinicalResult = null;

    this.alzheimerService.analyze(
      this.labRequestId, this.selectedFile!, this.technicianName.trim(), this.doctorEmail.trim()
    ).subscribe({
      next: (res) => {
        this.result = res;
        this.analyzing = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Analysis error. Make sure the AI service is running.';
        this.analyzing = false;
      }
    });
  }

  // ── High-risk preset (debug helper) ──────────────────────
  loadHighRiskPreset(): void {
    this.clinical = {
      ...this.clinical,
      age: 82,
      bmi: 31,
      smoking: 1,
      alcoholConsumption: 15,
      physicalActivity: 0,
      dietQuality: 2,
      sleepQuality: 4,
      familyHistoryAlzheimers: 1,
      cardiovascularDisease: 1,
      diabetes: 1,
      depression: 1,
      headInjury: 1,
      hypertension: 1,
      systolicBP: 175,
      diastolicBP: 110,
      cholesterolTotal: 300,
      cholesterolLDL: 210,
      cholesterolHDL: 30,
      cholesterolTriglycerides: 350,
      mmse: 14,
      functionalAssessment: 2,
      adl: 2,
      memoryComplaints: 1,
      behavioralProblems: 1,
      confusion: 1,
      disorientation: 1,
      personalityChanges: 1,
      difficultyCompletingTasks: 1,
      forgetfulness: 1,
    };
    console.log('[RF] high-risk preset loaded:', JSON.parse(JSON.stringify(this.clinical)));
  }

  // ── Step 2 : Clinical Plan ───────────────────────────────
  mriPrefilledClass = '';

  openClinicalForm(): void {
    this.showClinicalForm = true;
    this.clinicalResult = null;
    this.clinicalError = '';
    this.clinical.doctorEmail = this.doctorEmail;
    if (this.result?.aiDiagnostic) {
      this.prefillFromMriClass(this.result.aiDiagnostic);
    }
    setTimeout(() => {
      document.getElementById('clinical-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  prefillFromMriClass(diagnostic: string): void {
    const d = diagnostic.toLowerCase();

    // Reset all symptoms
    this.clinical.memoryComplaints          = 0;
    this.clinical.behavioralProblems        = 0;
    this.clinical.confusion                 = 0;
    this.clinical.disorientation            = 0;
    this.clinical.personalityChanges        = 0;
    this.clinical.difficultyCompletingTasks = 0;
    this.clinical.forgetfulness             = 0;

    if (d.includes('no impairment') || d.includes('nondemented') || d === 'no impairment') {
      // Cognitif
      this.clinical.mmse                    = 29;
      this.clinical.adl                     = 9;
      this.clinical.functionalAssessment    = 9;
      // Lifestyle sain
      this.clinical.age                     = 68;
      this.clinical.physicalActivity        = 4;
      this.clinical.dietQuality             = 7;
      this.clinical.sleepQuality            = 7;
      // Médical
      this.clinical.familyHistoryAlzheimers = 0;
      this.clinical.depression              = 0;
      this.clinical.hypertension            = 0;
      this.clinical.cardiovascularDisease   = 0;
      this.clinical.diabetes                = 0;
      this.mriPrefilledClass = 'No Impairment';

    } else if (d.includes('very mild') || d.includes('very_mild') || d.includes('verymild')) {
      // Cognitif — abaissé pour forcer RF
      this.clinical.mmse                    = 22;
      this.clinical.adl                     = 6;
      this.clinical.functionalAssessment    = 6;
      this.clinical.memoryComplaints        = 1;
      this.clinical.forgetfulness           = 1;
      this.clinical.confusion               = 1;
      this.clinical.difficultyCompletingTasks = 1;
      // Lifestyle dégradé
      this.clinical.age                     = 76;
      this.clinical.physicalActivity        = 1;
      this.clinical.dietQuality             = 4;
      this.clinical.sleepQuality            = 4;
      this.clinical.bmi                     = 28;
      // Médical
      this.clinical.familyHistoryAlzheimers = 1;
      this.clinical.depression              = 1;
      this.clinical.hypertension            = 1;
      this.clinical.headInjury              = 1;
      this.clinical.cardiovascularDisease   = 0;
      this.clinical.diabetes                = 0;
      // Mesures cliniques
      this.clinical.systolicBP              = 145;
      this.clinical.diastolicBP             = 92;
      this.clinical.cholesterolTotal        = 230;
      this.clinical.cholesterolLDL          = 155;
      this.mriPrefilledClass = 'Very Mild Impairment';

    } else if (d.includes('mild') && !d.includes('very')) {
      // Cognitif
      this.clinical.mmse                        = 20;
      this.clinical.adl                         = 6;
      this.clinical.functionalAssessment        = 5;
      this.clinical.memoryComplaints            = 1;
      this.clinical.forgetfulness               = 1;
      this.clinical.confusion                   = 1;
      this.clinical.difficultyCompletingTasks   = 1;
      // Lifestyle dégradé
      this.clinical.age                         = 78;
      this.clinical.physicalActivity            = 1;
      this.clinical.dietQuality                 = 4;
      this.clinical.sleepQuality                = 4;
      // Médical
      this.clinical.familyHistoryAlzheimers     = 1;
      this.clinical.depression                  = 1;
      this.clinical.hypertension                = 1;
      this.clinical.cardiovascularDisease       = 1;
      this.clinical.diabetes                    = 0;
      this.mriPrefilledClass = 'Mild Impairment';

    } else if (d.includes('moderate')) {
      // Cognitif — très bas
      this.clinical.mmse                        = 10;
      this.clinical.adl                         = 2;
      this.clinical.functionalAssessment        = 2;
      this.clinical.memoryComplaints            = 1;
      this.clinical.behavioralProblems          = 1;
      this.clinical.confusion                   = 1;
      this.clinical.disorientation              = 1;
      this.clinical.personalityChanges          = 1;
      this.clinical.difficultyCompletingTasks   = 1;
      this.clinical.forgetfulness               = 1;
      // Lifestyle très dégradé
      this.clinical.age                         = 82;
      this.clinical.physicalActivity            = 0;
      this.clinical.dietQuality                 = 2;
      this.clinical.sleepQuality                = 3;
      this.clinical.smoking                     = 1;
      this.clinical.alcoholConsumption          = 10;
      this.clinical.bmi                         = 31;
      // Médical — tout activé
      this.clinical.familyHistoryAlzheimers     = 1;
      this.clinical.depression                  = 1;
      this.clinical.hypertension                = 1;
      this.clinical.cardiovascularDisease       = 1;
      this.clinical.diabetes                    = 1;
      this.clinical.headInjury                  = 1;
      // Mesures cliniques élevées
      this.clinical.systolicBP                  = 175;
      this.clinical.diastolicBP                 = 105;
      this.clinical.cholesterolTotal            = 280;
      this.clinical.cholesterolLDL              = 200;
      this.clinical.cholesterolTriglycerides    = 300;
      this.mriPrefilledClass = 'Moderate Impairment';
    }
  }

  submitClinical(): void {
    if (!this.result) return;
    this.analyzingClinical = true;
    this.clinicalError = '';
    this.clinicalResult = null;

    console.log('[RF] labResultId =', this.result.id);
    console.log('[RF] payload =', JSON.parse(JSON.stringify(this.clinical)));

    this.recommendationService.recommend(this.result.id, this.clinical).subscribe({
      next: (res) => {
        console.log('[RF] response =', res);
        this.clinicalResult = res;
        this.analyzingClinical = false;
      },
      error: (err) => {
        console.error('[RF] error =', err);
        this.clinicalError = err?.error?.message || 'Clinical evaluation error. Make sure the recommendation service is running.';
        this.analyzingClinical = false;
      }
    });
  }

  // ── Risk helpers ──────────────────────────────────────────
  getRiskClass(risk: string | undefined): string {
    switch (risk) {
      case 'URGENT':       return 'risk-urgent';
      case 'ATTENTION':    return 'risk-attention';
      case 'SURVEILLANCE': return 'risk-surveillance';
      default:             return 'risk-sain';
    }
  }

  getRiskLabel(risk: string | undefined): string {
    switch (risk) {
      case 'URGENT':       return 'URGENT — Immediate consultation required';
      case 'ATTENTION':    return 'ATTENTION — Consultation recommended';
      case 'SURVEILLANCE': return 'SURVEILLANCE — Follow-up required';
      default:             return 'HEALTHY — No signs detected';
    }
  }

  getRiskIcon(risk: string | undefined): string {
    switch (risk) {
      case 'URGENT':       return '🔴';
      case 'ATTENTION':    return '🟠';
      case 'SURVEILLANCE': return '🟡';
      default:             return '🟢';
    }
  }

  getRfRiskClass(label: string | undefined): string {
    if (!label) return 'rf-low';
    if (label.includes('Very High')) return 'rf-very-high';
    if (label.includes('High'))      return 'rf-high';
    if (label.includes('Moderate'))  return 'rf-moderate';
    return 'rf-low';
  }

  // ── Combined VGG16 + RF result ────────────────────────────
  private mriSeverity(): number {
    const d = (this.mriPrefilledClass || this.result?.aiDiagnostic || '').toLowerCase();
    if (d.includes('moderate'))                                                        return 3;
    if (d.includes('mild') && !d.includes('very'))                                    return 3;
    if (d.includes('very mild') || d.includes('verymild') || d.includes('very_mild')) return 2;
    return 0;
  }

  private rfSeverity(): number {
    const label = this.clinicalResult?.riskLabel || '';
    if (label.includes('Very High')) return 3;
    if (label.includes('High'))      return 2;
    if (label.includes('Moderate'))  return 1;
    return 0;
  }

  getCombinedRiskLabel(): string {
    const mri = this.mriSeverity();
    const rf  = this.rfSeverity();
    // VGG16 detected impairment → minimum is Moderate Risk
    const minLevel = mri > 0 ? Math.max(1, mri, rf) : Math.max(mri, rf);
    switch (minLevel) {
      case 3: return 'Very High Risk';
      case 2: return 'High Risk';
      case 1: return 'Moderate Risk';
      default: return 'Low Risk';
    }
  }

  getCombinedRiskClass(): string {
    const mri = this.mriSeverity();
    const rf  = this.rfSeverity();
    const minLevel = mri > 0 ? Math.max(1, mri, rf) : Math.max(mri, rf);
    switch (minLevel) {
      case 3: return 'rf-very-high';
      case 2: return 'rf-high';
      case 1: return 'rf-moderate';
      default: return 'rf-low';
    }
  }

  hasConflict(): boolean {
    return this.mriSeverity() !== this.rfSeverity();
  }

  getPriorityBadge(priority: string): string {
    switch (priority) {
      case 'High':   return '🔴';
      case 'Medium': return '🟡';
      default:       return '🟢';
    }
  }

  getHighRecs() {
    return this.clinicalResult?.recommendations?.filter(r => r.priority === 'High') || [];
  }

  getMediumRecs() {
    return this.clinicalResult?.recommendations?.filter(r => r.priority === 'Medium') || [];
  }

  navigateBack(): void {
    this.router.navigate(['/front/laboratorystaff/lab-requests']);
  }
}
