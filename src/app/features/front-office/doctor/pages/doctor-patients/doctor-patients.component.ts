import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';

@Component({
  selector: 'app-doctor-patients',
  templateUrl: './doctor-patients.component.html',
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
}
