import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../../services/auth.service';
import { LabResultService, AlzheimerPatientSummary } from '../../../../../services/lab-result.service';
import { LaboratoryService } from '../../../../../services/laboratory.service';

@Component({
  selector: 'app-laboratorystaff-sidebar',
  templateUrl: './laboratory-sidebar.component.html',
  styleUrls: ['./laboratory-sidebar.component.scss']
})
export class LaboratoryStaffSidebarComponent implements OnInit, OnDestroy {

  patients: AlzheimerPatientSummary[] = [];
  historyOpen = false;
  private routeSub!: Subscription;

  constructor(
    private authService: AuthService,
    private labResultService: LabResultService,
    private laboratoryService: LaboratoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();

    // Recharge après chaque navigation (nouveau patient après analyse)
    this.routeSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.loadPatients());
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadPatients(): void {
    // Utilise l'endpoint existant getByLaboratory() → pas besoin d'un nouvel endpoint backend
    this.laboratoryService.getMyLaboratory().pipe(
      switchMap(lab => this.labResultService.getByLaboratory(lab.id))
    ).subscribe({
      next: (results) => {
        // Filtre uniquement les résultats avec analyse Alzheimer IA
        const aiResults = results.filter(r => r.aiRisk);

        // Groupe par patientName et construit le résumé
        const map = new Map<string, AlzheimerPatientSummary>();
        for (const r of aiResults) {
          const name = r.patientName;
          if (!map.has(name)) {
            map.set(name, {
              patientName:      name,
              lastRisk:         r.aiRisk!,
              totalAnalyses:    1,
              lastAnalysisDate: r.completedAt
            });
          } else {
            const existing = map.get(name)!;
            existing.totalAnalyses++;
            // Garde le résultat le plus récent comme "dernier"
            if (r.completedAt > existing.lastAnalysisDate) {
              existing.lastRisk         = r.aiRisk!;
              existing.lastAnalysisDate = r.completedAt;
            }
          }
        }

        this.patients = Array.from(map.values())
          .sort((a, b) => b.lastAnalysisDate.localeCompare(a.lastAnalysisDate));

        if (this.patients.length > 0) this.historyOpen = true;
      },
      error: () => { this.patients = []; }
    });
  }

  toggleHistory(): void {
    this.historyOpen = !this.historyOpen;
  }

  openHistory(patientName: string): void {
    this.router.navigate([
      '/front/laboratorystaff/alzheimer-history',
      encodeURIComponent(patientName)
    ]);
  }

  getRiskIcon(risk: string): string {
    switch (risk) {
      case 'URGENT':       return '🔴';
      case 'ATTENTION':    return '🟠';
      case 'SURVEILLANCE': return '🟡';
      default:             return '🟢';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
