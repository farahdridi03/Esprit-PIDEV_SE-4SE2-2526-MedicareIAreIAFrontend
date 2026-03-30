import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultationService } from '../../../../../services/consultation.service';
import { Consultation } from '../../../../../models/medical-records.model';

@Component({
  selector: 'app-doctor-consultation-details',
  templateUrl: './doctor-consultation-details.component.html',
  styleUrls: ['./doctor-consultation-details.component.scss']
})
export class DoctorConsultationDetailsComponent implements OnInit {
  patientId!: number;
  consultationId!: number;
  consultation: Consultation | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const pId = params.get('id');
      const cId = params.get('cid');
      
      if (pId && cId) {
        this.patientId = +pId;
        this.consultationId = +cId;
        this.loadConsultation();
      }
    });
  }

  loadConsultation(): void {
    this.loading = true;
    this.consultationService.getAll().subscribe({
      next: (data) => {
        const cons = data.find(c => c.id === this.consultationId);
        if (cons) {
          this.consultation = cons;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching consultation', err);
        this.loading = false;
      }
    });
  }
}
