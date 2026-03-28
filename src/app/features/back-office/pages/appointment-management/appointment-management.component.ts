import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../models/appointment.model';

@Component({
  selector: 'app-appointment-management',
  templateUrl: './appointment-management.component.html',
  styleUrl: './appointment-management.component.scss'
})
export class AppointmentManagementComponent implements OnInit {
  appointments: AppointmentDTO[] = [];
  filteredAppointments: AppointmentDTO[] = [];
  isLoading = true;
  searchQuery = '';
  statusFilter = 'ALL';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading appointments:', err);
        this.isLoading = false;
        // Mock data for demo purposes if backend fails
        this.mockAppointments();
      }
    });
  }

  mockAppointments(): void {
    // Basic mock if backend is down
    this.appointments = [
      { id: 1, patientId: 101, doctorId: 201, startTime: '2026-03-30T10:00:00', endTime: '2026-03-30T10:30:00', status: 'CONFIRMED', doctorName: 'Dr. Karimi El Arabi', patientName: 'Sofiane Rahimi' },
      { id: 2, patientId: 102, doctorId: 202, startTime: '2026-03-31T14:00:00', endTime: '2026-03-31T14:30:00', status: 'PENDING', doctorName: 'Dr. Myriem Belhaj', patientName: 'Amine Benali' },
      { id: 3, patientId: 103, doctorId: 201, startTime: '2026-03-27T09:00:00', endTime: '2026-03-27T09:30:00', status: 'CANCELLED', doctorName: 'Dr. Karimi El Arabi', patientName: 'Yassine Zahra' }
    ] as any;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointments.filter(app => {
      const matchesSearch = !this.searchQuery || 
        app.patientName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        app.doctorName?.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'ALL' || app.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  confirmAppointment(id: number): void {
    this.appointmentService.confirmAppointment(id).subscribe(() => {
      this.loadAppointments();
    });
  }

  cancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(id).subscribe(() => {
        this.loadAppointments();
      });
    }
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'badge-green';
      case 'PENDING': return 'badge-amber';
      case 'CANCELLED': return 'badge-red';
      default: return 'badge-gray';
    }
  }
}
