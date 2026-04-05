import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
  selector: 'app-appointment-management',
  templateUrl: './appointment-management.component.html',
  styleUrls: ['./appointment-management.component.scss']
})
export class AppointmentManagementComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  isLoading = true;
  filterStatus = '';
  searchQuery = '';

  statusOptions = ['BOOKED', 'CONFIRMED', 'LIVE', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments = data.sort((a: any, b: any) =>
          (b.date || '').localeCompare(a.date || '')
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(a => {
      const matchStatus = this.filterStatus ? a.status === this.filterStatus : true;
      const q = this.searchQuery.toLowerCase();
      const matchSearch = q
        ? (a.patientName || '').toLowerCase().includes(q) ||
          (a.doctorName || '').toLowerCase().includes(q)
        : true;
      return matchStatus && matchSearch;
    });
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      BOOKED: 'badge-orange',
      CONFIRMED: 'badge-blue',
      LIVE: 'badge-green',
      COMPLETED: 'badge-teal',
      CANCELLED: 'badge-red',
      RESCHEDULED: 'badge-purple'
    };
    return map[status] || 'badge-gray';
  }
}
