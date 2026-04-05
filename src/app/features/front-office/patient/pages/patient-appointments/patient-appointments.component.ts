import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.scss']
})
export class PatientAppointmentsComponent implements OnInit, OnDestroy {
  appointments: AppointmentDTO[] = [];
  upcomingAppointments: AppointmentDTO[] = [];
  pastAppointments: AppointmentDTO[] = [];
  cancelledAppointments: AppointmentDTO[] = [];
  activeTab: string = 'upcoming';
  isLoading = false;
  error: string | null = null;
  selectedAppointment: AppointmentDTO | null = null;
  refreshInterval: any;
  
  // Custom Modals
  showCancelModal: boolean = false;
  appointmentToCancelId: number | null = null;
  
  showDeleteModal: boolean = false;
  appointmentToDeleteId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    // Start polling every 10s to see if doctor started the live consult or confirmed
    this.refreshInterval = setInterval(() => {
      this.loadAppointments(false); // Silent refresh
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  loadAppointments(showLoader: boolean = true): void {
    if (showLoader) this.isLoading = true;
    this.error = null;
    const patientId = this.authService.getUserId();
    
    if (!patientId) {
      if (showLoader) {
        this.error = "Utilisateur non identifié. Veuillez vous reconnecter.";
        this.isLoading = false;
      }
      return;
    }

    this.appointmentService.getPatientAppointments(patientId)
      .subscribe({
        next: (data) => {
          this.appointments = [...data].sort((a,b) => {
            const dateComp = (a.date || '').localeCompare(b.date || '');
            if (dateComp !== 0) return dateComp;
            return (a.startTime || '').localeCompare(b.startTime || '');
          });
          
          const now = new Date();
          const today = now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0');

          // UPCOMING: Includes BOOKED, CONFIRMED and LIVE (important for joining the room)
          this.upcomingAppointments = this.appointments.filter(a => {
            const isFutureOrToday = (a.date || '') >= today;
            const isActiveStatus = ['BOOKED', 'CONFIRMED', 'LIVE', 'RESCHEDULED'].includes(a.status || '');
            return isFutureOrToday && isActiveStatus;
          });

          // PAST: Everything strictly before today, or COMPLETED
          this.pastAppointments = this.appointments.filter(a => {
            const isPast = (a.date || '') < today;
            const isCompleted = (a.status === 'COMPLETED');
            return (isPast && a.status !== 'CANCELLED' && a.status !== 'LIVE') || isCompleted;
          });

          this.cancelledAppointments = this.appointments.filter(a => a.status === 'CANCELLED');
          
          if (showLoader) this.isLoading = false;

          // Update selectedAppointment if open to reflect new status (meetingLink, etc)
          if (this.selectedAppointment) {
            const updated = this.appointments.find(a => a.id === this.selectedAppointment?.id);
            if (updated) this.selectedAppointment = updated;
          }
        },
        error: (err) => {
          console.error('[ERROR]', err);
          if (showLoader) {
            this.error = "Erreur lors du chargement des rendez-vous.";
            this.isLoading = false;
          }
        }
      });
  }

  viewDetails(appt: AppointmentDTO): void {
    this.selectedAppointment = appt;
  }

  closeDetails(): void {
    this.selectedAppointment = null;
  }

  isTeleconsultationActive(appt: AppointmentDTO): boolean {
    if (!appt || appt.mode !== 'ONLINE') return false;
    return appt.status === 'LIVE';
  }

  getTeleconsultationState(appt: AppointmentDTO): 'WAITING_CONFIRMATION' | 'WAITING_TIME' | 'WAITING_DOCTOR' | 'LIVE' | 'OTHER' {
    if (!appt || appt.mode !== 'ONLINE') return 'OTHER';
    if (appt.status === 'LIVE') return 'LIVE';
    if (appt.status === 'BOOKED') return 'WAITING_CONFIRMATION';
    if (appt.status !== 'CONFIRMED') return 'OTHER';

    // It is CONFIRMED, check time
    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    
    if (appt.date !== todayStr) {
        return (appt.date || '') > todayStr ? 'WAITING_TIME' : 'OTHER';
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = (appt.startTime || '00:00').split(':').map(Number);
    const startMinutes = startH * 60 + startM;

    if (currentMinutes < startMinutes - 5) {
        return 'WAITING_TIME';
    }

    return 'WAITING_DOCTOR';
  }

  openMaps(address: string | undefined): void {
    if (!address) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  }

  openMeeting(link: string | undefined): void {
    if (link) {
      const patientName = this.authService.getUserFullName() || 'Patient';
      const fullLink = `${link}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(patientName)}"`;
      window.open(fullLink, '_blank');
    }
  }

  getDoctorPhoto(appt: AppointmentDTO): string {
    if (!appt.doctorProfilePicture) return '';
    if (appt.doctorProfilePicture.startsWith('data:') || appt.doctorProfilePicture.startsWith('http')) {
      return appt.doctorProfilePicture;
    }
    return `data:image/png;base64,${appt.doctorProfilePicture}`;
  }

  getFallbackAvatar(name: string): string {
    const lowName = (name || '').toLowerCase();
    if (lowName.includes('bouthaina') || lowName.includes('sarah')) return '👩‍⚕️'; 
    return (lowName.startsWith('dr') || lowName.includes('mme')) ? '👩‍⚕️' : '👨‍⚕️';
  }

  formatName(name: string): string {
    if (!name) return '';
    if (name === name.toUpperCase()) {
      return name.split(' ')
                 .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                 .join(' ');
    }
    return name;
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.split('_')
                 .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                 .join(' ');
  }

  formatSpecialty(specialty: string): string {
    if (!specialty) return 'General Practice';
    return this.formatStatus(specialty);
  }

  cancelAppointment(id: number): void {
    this.appointmentToCancelId = id;
    this.showCancelModal = true;
  }

  confirmCancelAppointment(): void {
    if (!this.appointmentToCancelId) return;
    
    this.isLoading = true;
    this.appointmentService.cancelAppointment(this.appointmentToCancelId).subscribe({
      next: () => {
        this.showCancelModal = false;
        this.appointmentToCancelId = null;
        this.selectedAppointment = null;
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Cancel error:', err);
        this.isLoading = false;
        this.showCancelModal = false;
      }
    });
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.appointmentToCancelId = null;
  }

  // --- DELETE LOGIC ---
  openDeleteModal(id: number): void {
    this.appointmentToDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDeleteAppointment(): void {
    if (!this.appointmentToDeleteId) return;

    this.isLoading = true;
    this.appointmentService.deleteAppointment(this.appointmentToDeleteId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.appointmentToDeleteId = null;
        this.selectedAppointment = null;
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.isLoading = false;
        this.showDeleteModal = false;
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.appointmentToDeleteId = null;
  }
}
