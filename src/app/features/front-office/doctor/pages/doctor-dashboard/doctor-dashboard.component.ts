import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { AppointmentDTO } from '../../../../../models/appointment.model';
import { NotificationService } from '../../../../../services/notification.service';
import { NotificationDTO } from '../../../../../models/notification.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ConfirmDialogService } from '../../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  currentView: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' | 'notifications' | 'reviews' = 'overview';
  firstName: string = '';
  todayAppointments: AppointmentDTO[] = [];
  allAppointments: AppointmentDTO[] = [];
  isLoadingAppointments: boolean = true;
  totalPatientsCount: number = 0;
  
  // Notification properties
  notifications: NotificationDTO[] = [];
  unreadCount: number = 0;
  private notificationSub!: Subscription;
  
  // Calendar-related properties
  calendarDays: any[] = [];
  calendarDate: Date = new Date();
  selectedDateStr: string = '';
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  constructor(
    private cdr: ChangeDetectorRef,
    public authService: AuthService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private confirmService: ConfirmDialogService,
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
      
      // Use centralized notification service for WebSocket
      this.notificationService.connectWebSocket(doctorId);
      this.notificationSub = this.notificationService.notifications.subscribe(data => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.read).length;
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    this.notificationService.disconnectWebSocket();
  }

  loadNotifications(doctorId: number): void {
    this.notificationService.getNotifications(doctorId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.read).length;
        this.selectedNotifications.clear(); // Reset selection
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  markNotificationAsRead(notification: NotificationDTO): void {
    const doctorId = this.authService.getUserId();
    if (!notification.read) {
      this.notificationService.markAsRead(doctorId, notification.id).subscribe(() => {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.cdr.detectChanges();
      });
    }
  }

  // NEW: Selection & Deletion Logic
  selectedNotifications = new Set<number>();

  toggleSelection(notifId: number): void {
    if (this.selectedNotifications.has(notifId)) {
      this.selectedNotifications.delete(notifId);
    } else {
      this.selectedNotifications.add(notifId);
    }
    this.cdr.detectChanges();
  }

  toggleSelectAll(): void {
    if (this.selectedNotifications.size === this.notifications.length) {
      this.selectedNotifications.clear();
    } else {
      this.notifications.forEach(n => this.selectedNotifications.add(n.id));
    }
    this.cdr.detectChanges();
  }

  isAllSelected(): boolean {
    return this.notifications.length > 0 && this.selectedNotifications.size === this.notifications.length;
  }

  async deleteNotification(notifId: number, event?: Event) {
    if (event) event.stopPropagation();
    
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      type: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      const doctorId = this.authService.getUserId();
      this.notificationService.deleteNotification(doctorId, notifId).subscribe(() => {
        this.notifications = this.notifications.filter(n => n.id !== notifId);
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.selectedNotifications.delete(notifId);
        this.cdr.detectChanges();
      });
    }
  }

  async deleteSelected() {
    if (this.selectedNotifications.size === 0) return;
    
    const confirmed = await this.confirmService.confirm({
      title: 'Delete Selected',
      message: `Are you sure you want to delete ${this.selectedNotifications.size} selected notifications?`,
      type: 'danger',
      confirmText: 'Delete'
    });

    if (confirmed) {
      const doctorId = this.authService.getUserId();
      // Since we don't have a bulk delete endpoint for specific IDs, we loop or clear all if all selected
      if (this.selectedNotifications.size === this.notifications.length) {
        this.deleteAllNotifications();
      } else {
        // Simple loop for now (could be improved with a bulk endpoint)
        const ids = Array.from(this.selectedNotifications);
        let completed = 0;
        ids.forEach(id => {
          this.notificationService.deleteNotification(doctorId, id).subscribe(() => {
            completed++;
            if (completed === ids.length) {
              this.loadNotifications(doctorId);
            }
          });
        });
      }
    }
  }

  async deleteAllNotifications() {
    const confirmed = await this.confirmService.confirm({
      title: 'Delete All',
      message: 'Are you sure you want to delete ALL notifications?',
      type: 'danger',
      confirmText: 'Delete All'
    });

    if (confirmed) {
      const doctorId = this.authService.getUserId();
      this.notificationService.deleteAllNotifications(doctorId).subscribe(() => {
        this.notifications = [];
        this.unreadCount = 0;
        this.selectedNotifications.clear();
        this.cdr.detectChanges();
      });
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

  setView(view: 'overview' | 'settings' | 'exceptions' | 'calendar' | 'patients' | 'notifications' | 'reviews') {
    this.currentView = view;
    // Update URL without full reload
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: view },
      queryParamsHandling: 'merge'
    });
    this.cdr.detectChanges();
  }

  goToPatients() { 
    this.router.navigate(['/front/doctor/patients']); 
  }
  
  goToCalendar() { 
    this.router.navigate(['/front/doctor/calendar']); 
  }
  
  goToReviews() { 
    this.router.navigate(['/front/doctor/reviews']); 
  }

}
