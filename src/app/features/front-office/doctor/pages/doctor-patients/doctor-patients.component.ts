import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { PatientService } from '../../../../../services/patient.service';
import { MedicalRecordService } from '../../../../../services/medical-record.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';
import { PatientResponseDTO } from '../../../../../models/patient.model';

@Component({
  selector: 'app-doctor-patients',
  templateUrl: './doctor-patients.component.html',
  styleUrls: ['./doctor-patients.component.scss']
})
export class DoctorPatientsComponent implements OnInit {
  // Appointment Data (Planning)
  todayAppointments: AppointmentDTO[] = [];
  allPatientsFromAppts: any[] = [];
  displayMode: 'today' | 'all' = 'today';
  isLoadingAppointments: boolean = true;
  
  // Patient List Data (Records)
  patients: (PatientResponseDTO & { hasMedicalRecord?: boolean })[] = [];
  loading: boolean = true;
  error: string | null = null;
  creatingRecordForId: number | null = null;
  
  firstName: string = 'Docteur';

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private medicalRecordService: MedicalRecordService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.firstName = this.authService.getUserFullName() || 'Docteur';
    const doctorId = this.authService.getUserId();
    
    if (doctorId) {
      this.loadTodayAppointments(doctorId);
    }
    
    this.fetchPatients();
  }

  // --- Planning / Appointments ---
  loadTodayAppointments(doctorId: number): void {
    this.isLoadingAppointments = true;
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (data) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        this.todayAppointments = data.filter(a => a.date === todayStr)
                                    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
        
        const patientMap = new Map<number, any>();
        data.forEach(appt => {
          if (!appt.patientId) return;
          const existing = patientMap.get(appt.patientId);
          if (!existing || (appt.date && appt.date > existing.lastAppointmentDate)) {
            patientMap.set(appt.patientId, {
              id: appt.patientId,
              name: appt.patientName,
              lastAppointmentDate: appt.date,
              lastAppointmentStatus: appt.status,
              totalAppointments: (existing?.totalAppointments || 0) + 1,
              mode: appt.mode
            });
          } else if (existing) {
             existing.totalAppointments++;
          }
        });
        
        this.allPatientsFromAppts = Array.from(patientMap.values()).sort((a,b) => {
          const dateA = a.lastAppointmentDate || '';
          const dateB = b.lastAppointmentDate || '';
          return dateB.localeCompare(dateA);
        });
        
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      }
    });
  }

  setMode(mode: 'today' | 'all'): void {
    this.displayMode = mode;
    this.cdr.detectChanges();
  }

  // --- Patient Record Management ---
  fetchPatients(): void {
    this.loading = true;
    this.patientService.getMyPatients().subscribe({
      next: (patientsData) => {
        this.patients = patientsData;
        this.medicalRecordService.getAll().subscribe({
          next: (records) => {
            this.patients.forEach(p => {
              p.hasMedicalRecord = !!(records as any[]).find(r => r.patientId === p.id || (r.patient && r.patient.id === p.id));
            });
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error fetching medical records:', err);
            this.patients.forEach(p => p.hasMedicalRecord = false);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        this.error = 'Failed to load patients details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createMedicalRecord(patientId: number): void {
    this.creatingRecordForId = patientId;
    this.medicalRecordService.add({ patientId: patientId }).subscribe({
      next: () => {
        this.creatingRecordForId = null;
        this.router.navigate(['/front/doctor/patient', patientId, 'record']);
      },
      error: () => {
        // Fallback Variant 2
        this.medicalRecordService.add({ patient: { id: patientId } }).subscribe({
          next: () => {
            this.creatingRecordForId = null;
            this.router.navigate(['/front/doctor/patient', patientId, 'record']);
          },
          error: () => {
            this.creatingRecordForId = null;
            alert('Impossible de créer le dossier médical.');
          }
        });
      }
    });
  }

  // --- Consultation Actions ---
  confirmAppointment(id: number): void {
    this.appointmentService.confirmAppointment(id).subscribe({
      next: () => {
        const doctorId = this.authService.getUserId();
        if (doctorId) this.loadTodayAppointments(doctorId);
      }
    });
  }

  startConsultation(app: AppointmentDTO): void {
    this.appointmentService.startTeleconsultation(app.id).subscribe({
      next: (res) => {
        if (res.meetingLink) {
          const authName = this.authService.getUserFullName() || this.firstName;
          const finalLink = `${res.meetingLink}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent('Dr. ' + authName)}"`;
          window.open(finalLink, '_blank');
        }
        const doctorId = this.authService.getUserId();
        if (doctorId) this.loadTodayAppointments(doctorId);
      }
    });
  }

  openMeeting(link: string | undefined): void {
    if (link) {
      const authName = this.authService.getUserFullName() || this.firstName;
      const fullLink = `${link}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent('Dr. ' + authName)}"`;
      window.open(fullLink, '_blank');
    }
  }

  completeConsultation(app: AppointmentDTO): void {
    if(confirm('Terminer cette consultation en ligne ?')) {
      this.appointmentService.completeAppointment(app.id).subscribe({
        next: () => {
          const doctorId = this.authService.getUserId();
          if (doctorId) this.loadTodayAppointments(doctorId);
        }
      });
    }
  }
}
