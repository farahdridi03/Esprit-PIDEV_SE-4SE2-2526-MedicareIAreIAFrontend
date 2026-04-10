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
  // Appointment view properties
  todayAppointments: AppointmentDTO[] = [];
  allAppointments: AppointmentDTO[] = []; // All appointments individually
  allPatients: any[] = []; // Unique patients summary
  displayMode: 'today' | 'all' = 'today';
  isLoadingAppointments: boolean = true;
  firstName: string = '';

  // Patient management properties (from MedicalRecord/Patient branches)
  patients: (PatientResponseDTO & { hasMedicalRecord?: boolean })[] = [];
  loading: boolean = true;
  error: string | null = null;
  creatingRecordForId: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private medicalRecordService: MedicalRecordService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.firstName = this.authService.getUserFullName() || 'Docteur';
    const doctorId = this.authService.getUserId();
    
    // Load both datasets
    if (doctorId) {
      this.loadTodayAppointments(doctorId);
    }
    this.fetchPatients();
  }

  loadTodayAppointments(doctorId: number): void {
    this.isLoadingAppointments = true;
    
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (data) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        this.todayAppointments = data.filter(a => a.date === todayStr)
                                    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

        // All appointments individually, sorted by date desc then time
        this.allAppointments = [...data].sort((a, b) => {
          const dateCompare = (b.date || '').localeCompare(a.date || '');
          return dateCompare !== 0 ? dateCompare : (a.startTime || '').localeCompare(b.startTime || '');
        });

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

        this.allPatients = Array.from(patientMap.values()).sort((a,b) => {
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

  fetchPatients(): void {
    this.loading = true;
    this.error = null;
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
        this.error = 'Failed to load patients details. Check console for details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setMode(mode: 'today' | 'all'): void {
    this.displayMode = mode;
    this.cdr.detectChanges();
  }

  confirmAppointment(id: number): void {
    this.appointmentService.confirmAppointment(id).subscribe({
      next: () => {
        const doctorId = this.authService.getUserId();
        if (doctorId) this.loadTodayAppointments(doctorId);
      },
      error: (err) => console.error('Confirm error:', err)
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
      },
      error: (err) => console.error('Start room error:', err)
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
        },
        error: (err) => console.error('Complete error:', err)
      });
    }
  }

  createMedicalRecord(patientId: number): void {
    this.creatingRecordForId = patientId;
    
    // Attempt to create medical record with various payload formats
    const payload = { patientId: patientId };

    this.medicalRecordService.add(payload).subscribe({
      next: () => {
        this.creatingRecordForId = null;
        this.router.navigate(['/front/doctor/patient', patientId, 'record']);
      },
      error: (err) => {
        console.warn('Fallback Variant 2 payload attempt...');
        this.medicalRecordService.add({ patient: { id: patientId } }).subscribe({
            next: () => {
                this.creatingRecordForId = null;
                this.router.navigate(['/front/doctor/patient', patientId, 'record']);
            },
            error: (err2) => {
                console.warn('Fallback Variant 3 payload attempt...');
                this.medicalRecordService.add({ user: { id: patientId } }).subscribe({
                    next: () => {
                        this.creatingRecordForId = null;
                        this.router.navigate(['/front/doctor/patient', patientId, 'record']);
                    },
                    error: (err3) => {
                        this.creatingRecordForId = null;
                        console.error('All creation attempts failed:', err3.error || err3);
                        alert('Failed to create medical record.');
                    }
                });
            }
        });
      }
    });
  }
}
