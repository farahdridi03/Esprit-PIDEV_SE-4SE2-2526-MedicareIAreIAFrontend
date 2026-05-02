import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';

@Component({
  selector: 'app-patient-prescription-detail',
  templateUrl: './patient-prescription-detail.component.html',
  styleUrls: ['./patient-prescription-detail.component.scss']
})
export class PatientPrescriptionDetailComponent implements OnInit {
  public prescriptionId: number = 0;
  public prescription: any = null;
  public loading: boolean = true;
  public daysUntilExpiry: number | null = null;
  public expiringSoon: boolean = false;
  public patientName: string = '';
  public patientAge: number | null = null;
  public patientGender: string = '';
  public patientWeight: number | null = null;
  public today: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.prescriptionId = +params['id'];
      this.loadData();
    });
  }

  loadData(): void {
    this.loading = true;
    this.patientService.getMe().subscribe({
      next: (patient: any) => {
        this.patientName = patient.fullName;
        this.patientGender = patient.gender;
        this.patientWeight = patient.weight;
        
        if (patient.birthDate) {
          const birthDate = new Date(patient.birthDate);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          this.patientAge = age;
        }

        const prescriptions = patient.prescriptions || [];
        this.prescription = prescriptions.find((p: any) => p.id === this.prescriptionId);
        
        if (this.prescription) {
          this.calculateExpiry();
        }
        
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateExpiry(): void {
    if (this.prescription && this.prescription.expiryDate && this.prescription.status === 'ACTIVE') {
      const diffTime = new Date(this.prescription.expiryDate).getTime() - new Date().getTime();
      this.daysUntilExpiry = Math.ceil(diffTime / 86400000);
      
      if (this.daysUntilExpiry > 0 && this.daysUntilExpiry <= 7) {
        this.expiringSoon = true;
      } else {
        this.expiringSoon = false;
      }
    } else {
      this.daysUntilExpiry = null;
      this.expiringSoon = false;
    }
  }

  async downloadPrescription(): Promise<void> {
    if (!this.prescription || this.prescription.status === 'EXPIRED') return;
    
    const element = document.getElementById('prescription-pdf-template');
    if (!element) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`prescription_${this.prescription.id}_${this.patientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }
}
