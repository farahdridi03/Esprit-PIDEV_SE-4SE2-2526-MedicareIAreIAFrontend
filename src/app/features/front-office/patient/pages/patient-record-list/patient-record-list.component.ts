import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { TreatmentService } from '../../../../../services/treatment.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';

@Component({
  selector: 'app-patient-record-list',
  templateUrl: './patient-record-list.component.html',
  styleUrls: ['./patient-record-list.component.scss']
})
export class PatientRecordListComponent implements OnInit {
  type: string = '';
  title: string = '';
  data: any[] = [];
  loading: boolean = true;
  
  // Metrics for prescriptions
  totalPrescriptions: number = 0;
  activePrescriptions: number = 0;
  expiredPrescriptions: number = 0;
  cancelledPrescriptions: number = 0;

  // Patient Info for PDF
  patientName: string = '';
  patientAge: number | null = null;
  patientGender: string = '';
  patientWeight: number | null = null;
  currentPrescription: any = null;
  public today: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private treatmentService: TreatmentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.type = params['type'];
      this.setMetadata();
      this.loadData();
    });
  }

  setMetadata(): void {
    switch (this.type) {
      case 'consultations': 
        this.title = 'Consultation History'; 
        break;
      case 'prescriptions': 
        this.title = 'My Prescriptions'; 
        break;
      case 'treatments': 
        this.title = 'My Treatments'; 
        break;
      case 'diagnoses': 
        this.title = 'My Diagnoses'; 
        break;
      default: 
        this.title = 'Medical Records';
    }
  }

  loadData(): void {
    this.loading = true;
    this.patientService.getMe().subscribe({
      next: (patient: any) => {
        // Set Patient Info for PDF
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

        const rawData = patient[this.type] || [];
        
        // Map doctorName and date from consultations to treatments and diagnoses
        if ((this.type === 'treatments' || this.type === 'diagnoses' || this.type === 'prescriptions') && patient.consultations) {
            rawData.forEach((item: any) => {
                const cons = patient.consultations.find((c: any) => c.id === item.consultationId);
                if (cons) {
                    if (!item.doctorName) item.doctorName = cons.doctorName;
                    if (!item.doctorSpecialty) item.doctorSpecialty = cons.specialty;
                    if (!item.date && cons.date) {
                        item.date = cons.date;
                    }
                }
            });
        }

        // Sort by date if applicable
        this.data = rawData.sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.startDate).getTime();
          const dateB = new Date(b.date || b.startDate).getTime();
          return dateB - dateA;
        });

        if (this.type === 'prescriptions') {
            this.totalPrescriptions = this.data.length;
            this.activePrescriptions = this.data.filter(p => p.status === 'ACTIVE').length;
            this.expiredPrescriptions = this.data.filter(p => p.status === 'EXPIRED').length;
            this.cancelledPrescriptions = this.data.filter(p => p.status === 'CANCELLED').length;
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  async downloadPrescription(item: any): Promise<void> {
    if (item.status === 'EXPIRED') return;
    
    // Set current prescription for the template
    this.currentPrescription = item;
    
    // Allow a small delay for the template to update
    await new Promise(resolve => setTimeout(resolve, 100));

    const element = document.getElementById('prescription-pdf-template');
    if (!element) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
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
      pdf.save(`prescription_${item.id}_${this.patientName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
        this.currentPrescription = null;
    }
  }
}
