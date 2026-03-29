import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' = 'overview';
  firstName: string = '';
  todayAppointments: AppointmentDTO[] = [];
  allAppointments: AppointmentDTO[] = [];
  isLoadingAppointments: boolean = true;
  totalPatientsCount: number = 0;
  
  // Calendar-related properties
  calendarDays: any[] = [];
  calendarDate: Date = new Date();
  selectedDateStr: string = '';
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const fullName = this.authService.getUserFullName() || 'Docteur';
    // Clean name handling
    this.firstName = (fullName.toLowerCase().startsWith('dr') || fullName.toLowerCase().startsWith('dr.')) 
                     ? fullName.split(' ').slice(1).join(' ') 
                     : fullName;
    
    // Listen for query params to switch internal views
    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        this.currentView = params['view'];
        this.cdr.detectChanges();
      }
    });
    
    const doctorId = this.authService.getUserId();
    if (doctorId) {
      // Set initial selected date to today
      const now = new Date();
      this.selectedDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      this.loadDashboardData(doctorId);
    }
  }

  loadDashboardData(doctorId: number): void {
    const today = this.selectedDateStr;
    this.isLoadingAppointments = true;
    
    // Fetch appointments for SELECTED date
    this.appointmentService.getDoctorAppointments(doctorId, today).subscribe({
      next: (data) => {
        this.todayAppointments = data || [];
        this.isLoadingAppointments = false;
        this.cdr.detectChanges();
      },
      error: () => this.isLoadingAppointments = false
    });

    // Fetch all appts for stats and calendar markers
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (data) => {
        this.allAppointments = data || [];
        // Unique patients count
        const patientIds = new Set(this.allAppointments.map(a => a.patientId));
        this.totalPatientsCount = patientIds.size;
        
        this.generateCalendar();
        this.cdr.detectChanges();
      }
    });
  }

  generateCalendar(): void {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: any[] = [];
    
    // Prev month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, currentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const apptsCount = this.allAppointments.filter(a => a.date === dateStr).length;
      
      days.push({ 
        day: i, 
        currentMonth: true, 
        dateStr: dateStr,
        hasAppointments: apptsCount > 0,
        count: apptsCount,
        isToday: dateStr === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
      });
    }
    
    // Next month days (fill the grid)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, currentMonth: false });
    }
    
    this.calendarDays = days;
  }

  prevMonth(): void {
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDay(dateStr?: string): void {
    if (!dateStr) return;
    this.selectedDateStr = dateStr;
    const doctorId = this.authService.getUserId();
    if (doctorId) {
      this.loadDashboardData(doctorId);
    }
  }

  getPendingCount(): number {
    return this.todayAppointments.filter(a => a.status === 'BOOKED' || a.status === 'PENDING').length;
  }

  getLiveCount(): number {
    return this.todayAppointments.filter(a => a.status === 'LIVE').length;
  }

  getPendingReviews(): number {
     // Mock for now, linked to past completed appointments
     return this.allAppointments.filter(a => a.status === 'COMPLETED').length % 7;
  }

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients') {
    this.currentView = view;
    // Update URL without full reload
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view },
      queryParamsHandling: 'merge'
    });
    this.cdr.detectChanges();
  }
}
