import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { LabResultService, LabResultResponse } from '../../../../../services/lab-result.service';
import { LaboratoryService } from '../../../../../services/laboratory.service';

@Component({
  selector: 'app-alzheimer-history',
  templateUrl: './alzheimer-history.component.html',
  styleUrls: ['./alzheimer-history.component.scss']
})
export class AlzheimerHistoryComponent implements OnInit {

  patientName = '';
  history: LabResultResponse[] = [];
  loading = true;
  error   = '';

  // ── Chart ─────────────────────────────────────────────────
  readonly CHART_HEIGHT = 180;
  readonly RISK_ORDER: Record<string, number> = {
    SAIN: 10, SURVEILLANCE: 40, ATTENTION: 70, URGENT: 95
  };

  constructor(
    private route:             ActivatedRoute,
    private router:            Router,
    private labResultService:  LabResultService,
    private laboratoryService: LaboratoryService
  ) {}

  ngOnInit(): void {
    this.patientName = decodeURIComponent(
      this.route.snapshot.paramMap.get('patientName') || ''
    );
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.error   = '';
    this.laboratoryService.getMyLaboratory().pipe(
      switchMap(lab => this.labResultService.getByLaboratory(lab.id))
    ).subscribe({
      next: (data) => {
        this.history = data
          .filter(r => r.aiRisk && r.patientName === this.patientName)
          .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
        this.loading = false;
      },
      error: (err) => {
        this.error   = err?.error?.message || 'Impossible de charger l\'historique.';
        this.loading = false;
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

  getRiskIcon(risk: string | undefined): string {
    switch (risk) {
      case 'URGENT':       return '🔴';
      case 'ATTENTION':    return '🟠';
      case 'SURVEILLANCE': return '🟡';
      default:             return '🟢';
    }
  }

  getRiskLabel(risk: string | undefined): string {
    switch (risk) {
      case 'URGENT':       return 'URGENT';
      case 'ATTENTION':    return 'ATTENTION';
      case 'SURVEILLANCE': return 'SURVEILLANCE';
      default:             return 'SAIN';
    }
  }

  getTrend(): string {
    if (this.history.length < 2) return 'stable';
    const last   = this.RISK_ORDER[this.history[this.history.length - 1].aiRisk || 'SAIN'] ?? 0;
    const before = this.RISK_ORDER[this.history[this.history.length - 2].aiRisk || 'SAIN'] ?? 0;
    if (last > before) return 'up';
    if (last < before) return 'down';
    return 'stable';
  }

  needsFollowUp(risk: string | undefined): boolean {
    return risk === 'URGENT' || risk === 'ATTENTION';
  }

  isLastResult(index: number): boolean {
    return index === this.history.length - 1;
  }

  // ── Chart helpers ─────────────────────────────────────────
  getDotY(risk: string | undefined): number {
    const pct = this.RISK_ORDER[risk || 'SAIN'] ?? 10;
    return this.CHART_HEIGHT - (pct / 100) * this.CHART_HEIGHT;
  }

  getDotX(index: number): number {
    if (this.history.length <= 1) return 50;
    return (index / (this.history.length - 1)) * 100;
  }

  getPolyline(): string {
    if (this.history.length === 0) return '';
    return this.history.map((r, i) => {
      const x = this.getDotX(i);
      const y = this.getDotY(r.aiRisk);
      return `${x},${y}`;
    }).join(' ');
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  navigateBack(): void {
    this.router.navigate(['/front/laboratorystaff/lab-requests']);
  }
}
