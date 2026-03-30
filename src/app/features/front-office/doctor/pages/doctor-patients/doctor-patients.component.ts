<<<<<<< HEAD
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';
=======
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../../../../services/patient.service';
import { MedicalRecordService } from '../../../../../services/medical-record.service';
import { PatientResponseDTO } from '../../../../../models/patient.model';
>>>>>>> origin/frontVersion1

@Component({
  selector: 'app-doctor-patients',
  templateUrl: './doctor-patients.component.html',
<<<<<<< HEAD
  styleUrls: ['./doctor-patients.component.scss']
})
export class DoctorPatientsComponent implements OnInit {
  todayAppointments: AppointmentDTO[] = [];
  allPatients: any[] = [];
  displayMode: 'today' | 'all' = 'today';
  isLoadingAppointments: boolean = true;
  firstName: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.firstName = this.authService.getUserFullName() || 'Docteur';
    const doctorId = this.authService.getUserId();
    if (doctorId) {
      this.loadTodayAppointments(doctorId);
    }
  }

  loadTodayAppointments(doctorId: number): void {
    this.isLoadingAppointments = true;
    
    // Fetch EVERYTHING to populate both views
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (data) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // 1. Keep today's appointments for the "Planning du jour"
        this.todayAppointments = data.filter(a => a.date === todayStr)
                                    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
        
        // 2. Generate a Unique Patients List from all appointments
        const patientMap = new Map<number, any>();
        
        data.forEach(appt => {
          if (!appt.patientId) return;
          
          const existing = patientMap.get(appt.patientId);
          // If not exists OR current appt is newer than the saved one
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
=======
  styleUrl: './doctor-patients.component.scss'
})
export class DoctorPatientsComponent implements OnInit {
  // Extending the original PatientResponseDTO for UI purposes
  patients: (PatientResponseDTO & { hasMedicalRecord?: boolean })[] = [];
  loading: boolean = true;
  error: string | null = null;
  creatingRecordForId: number | null = null;

  constructor(
    private patientService: PatientService,
    private medicalRecordService: MedicalRecordService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchPatients();
  }

  fetchPatients(): void {
    this.loading = true;
    this.patientService.getMyPatients().subscribe({
      next: (patientsData) => {
        this.patients = patientsData;
        
        // Fetch Medical Records to map against patients
        this.medicalRecordService.getAll().subscribe({
          next: (records) => {
            this.patients.forEach(p => {
              // Check if any record matches this patient's ID
              p.hasMedicalRecord = !!(records as any[]).find(r => r.patientId === p.id || (r.patient && r.patient.id === p.id));
            });
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching medical records:', err);
            // Default to hasMedicalRecord false if we can't fetch them, or show an error
            this.patients.forEach(p => p.hasMedicalRecord = false);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        if (err.error && typeof err.error.text === 'string') {
          console.error('--- RAW SERVER RESPONSE TEXT ---');
          console.error(err.error.text);
          console.error('--------------------------------');
        } else if (err.message) {
          console.error('Error message:', err.message);
        }
        this.error = 'Failed to load patients details. Check console for exact server response format.';
        this.loading = false;
>>>>>>> origin/frontVersion1
      }
    });
  }

<<<<<<< HEAD
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
}
=======
  createMedicalRecord(patientId: number): void {
    this.creatingRecordForId = patientId;
    
    // First try the DTO-friendly exact match from our frontend model
    const payload = {
      patientId: patientId
    };

    this.medicalRecordService.add(payload).subscribe({
      next: () => {
        this.creatingRecordForId = null;
        this.router.navigate(['/front/doctor/patient', patientId, 'record']);
      },
      error: (err) => {
        console.error('Error creating Medical Record (Variant 1):', err.error || err);
        
        // Fallback Variant 2: Entity mapping { patient: { id } }
        console.warn("Attempting fallback Variant 2 payload...");
        this.medicalRecordService.add({ patient: { id: patientId } }).subscribe({
            next: () => {
                this.creatingRecordForId = null;
                this.router.navigate(['/front/doctor/patient', patientId, 'record']);
            },
            error: (err2) => {
                console.error('Fallback Variant 2 error:', err2.error || err2);
                
                // Fallback Variant 3: Entity mapping { user: { id } }
                console.warn("Attempting fallback Variant 3 payload...");
                this.medicalRecordService.add({ user: { id: patientId } }).subscribe({
                    next: () => {
                        this.creatingRecordForId = null;
                        this.router.navigate(['/front/doctor/patient', patientId, 'record']);
                    },
                    error: (err3) => {
                        this.creatingRecordForId = null;
                        console.error('Fallback Variant 3 error:', err3.error || err3);
                        alert('Failed to create medical record. Please check the console logs for validation errors.');
                    }
                });
            }
        });
      }
    });
  }
}

>>>>>>> origin/frontVersion1
