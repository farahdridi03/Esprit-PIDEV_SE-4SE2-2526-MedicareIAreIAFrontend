import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DoctorService, DoctorProfile } from '../../../../../services/doctor.service';
import { ScheduleService } from '../../../../../services/schedule.service';
import { ReviewService } from '../../../../../services/review.service';
import { AuthService } from '../../../../../services/auth.service';
import { AppointmentService } from '../../../../../services/appointment.service';
import { Review } from '../../../../../models/review.model';
import { AvailableSlot } from '../../../../../models/available-slot.model';

@Component({
  selector: 'app-patient-doctor-detail',
  templateUrl: './patient-doctor-detail.component.html',
  styleUrls: ['./patient-doctor-detail.component.scss']
})
export class PatientDoctorDetailComponent implements OnInit {
  activeTab: 'about' | 'availability' | 'review' = 'about';
  doctorId: number = 0;
  doctor: DoctorProfile | null = null;
  isLoading: boolean = true;
  error: string = '';
  successMessage: string = '';

  formattedSchedule: { label: string, time: string }[] = [];

  // Reviews
  reviews: Review[] = [];
  newReviewRating: number = 0;
  newReviewComment: string = '';
  isSubmittingReview: boolean = false;

  // Availability & Calendar
  currentMonthDate: Date = new Date();
  calendarDays: { date: Date, isActive: boolean, isToday: boolean, isSelected: boolean, isCurrentMonth: boolean }[] = [];
  selectedDate: Date = new Date();
  availableSlots: AvailableSlot[] = [];
  isLoadingSlots: boolean = false;
  selectedSlot: AvailableSlot | null = null;

  // Booking Modal
  showBookingModal: boolean = false;
  bookingReason: string = '';
  isBooking: boolean = false;

  predefinedReasons: string[] = [
    'Routine checkup', 'Follow-up visit', 'Test results', 'Back pain', 
    'Headache', 'Fever', 'Chest pain', 'Fatigue', 'Other'
  ];
  selectedReason: string = '';
  customReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private scheduleService: ScheduleService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private http: HttpClient
  ) { }

  availableDates: Set<string> = new Set<string>();

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.doctorId = +params['id'];
      if (this.doctorId) {
        this.loadDoctorProfile();
        this.loadReviews();
        // Le chargement du calendrier extraira aussi les dispos pour le Profile
        this.loadMonthAvailabilities(); 
        this.loadSlotsForDate(this.selectedDate);
      }
    });
  }

  goBack() {
    this.router.navigate(['/front/patient/doctors']);
  }

  loadDoctorProfile() {
    this.doctorService.getDoctor(this.doctorId).subscribe({
      next: (data) => {
        this.doctor = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load doctor profile';
        this.isLoading = false;
      }
    });
  }

  private extractScheduleOverview(slots: any[]) {
    const todayStr = this.formatDate(new Date());
    
    // 1. Filtrer pour ne garder que les dates >= aujourd'hui
    const upcomingSlots = slots.filter(s => {
      let d = typeof s.startTime === 'string' ? s.startTime.split('T')[0] : '';
      if (Array.isArray(s.startTime)) {
        d = `${s.startTime[0]}-${String(s.startTime[1]).padStart(2, '0')}-${String(s.startTime[2]).padStart(2, '0')}`;
      }
      return d >= todayStr;
    });

    if (upcomingSlots.length === 0) {
      this.formattedSchedule = [];
      return;
    }

    // 2. Grouper par Date YYYY-MM-DD
    const groupedByDate: { [date: string]: { min: string, max: string } } = {};

    upcomingSlots.forEach(slot => {
      let dateStr = '';
      let startT = '';
      if (typeof slot.startTime === 'string') {
        const parts = slot.startTime.split('T');
        dateStr = parts[0];
        startT = parts[1].substring(0, 5);
      } else if (Array.isArray(slot.startTime)) {
        dateStr = `${slot.startTime[0]}-${String(slot.startTime[1]).padStart(2, '0')}-${String(slot.startTime[2]).padStart(2, '0')}`;
        startT = `${String(slot.startTime[3] || 0).padStart(2, '0')}:${String(slot.startTime[4] || 0).padStart(2, '0')}`;
      }

      let endT = '';
      if (typeof slot.endTime === 'string') {
        endT = slot.endTime.split('T')[1].substring(0, 5);
      } else if (Array.isArray(slot.endTime)) {
        endT = `${String(slot.endTime[3] || 0).padStart(2, '0')}:${String(slot.endTime[4] || 0).padStart(2, '0')}`;
      }

      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = { min: startT, max: endT };
      } else {
        if (startT < groupedByDate[dateStr].min) groupedByDate[dateStr].min = startT;
        if (endT > groupedByDate[dateStr].max) groupedByDate[dateStr].max = endT;
      }
    });

    // 3. Convertir au format lisible
    const sortedDates = Object.keys(groupedByDate).sort();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // On affiche les 5 ou 7 prochains jours d'ouverture par exemple, ou tout
    this.formattedSchedule = sortedDates.slice(0, 7).map(dStr => {
      const parts = dStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      
      const dayName = days[dateObj.getDay()];
      const monthName = months[dateObj.getMonth()];
      const dNum = String(dateObj.getDate()).padStart(2, '0');
      
      const minT = this.formatTime(groupedByDate[dStr].min);
      const maxT = this.formatTime(groupedByDate[dStr].max);
      
      return {
        label: `${dayName} ${dNum} ${monthName}`,
        time: `${minT} - ${maxT}`
      };
    });
  }

  private formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }

  loadReviews() {
    this.reviewService.getReviews(this.doctorId).subscribe({
      next: (data) => this.reviews = data,
      error: (err) => console.error('Error fetching reviews', err)
    });
  }

  setTab(tab: 'about' | 'availability' | 'review') {
    this.activeTab = tab;
  }

  loadMonthAvailabilities() {
    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();
    
    // We fetch a bit wider range (-10 days, +40 days) to cover the calendar grid
    const start = new Date(year, month, -7);
    const end = new Date(year, month + 1, 7);
    
    this.doctorService.getMonthAvailabilities(this.doctorId, this.formatDate(start), this.formatDate(end)).subscribe({
      next: (slots) => {
        this.availableDates.clear();
        slots.forEach(slot => {
          // Extrait la date YYYY-MM-DD depuis la dateTime '2026-03-25T09:00:00'
          const dateStr = slot.startTime.split('T')[0];
          this.availableDates.add(dateStr);
        });
        
        // --- EXTRAIRE LES DISPONIBILITES POUR LE PROFIL ---
        this.extractScheduleOverview(slots);
        
        this.buildCalendar();
      },
      error: () => {
        // En cas d'erreur on construit quand même le calendrier mais rien ne sera cliquable
        this.buildCalendar();
      }
    });
  }

  // --- Calendar Logic ---
  buildCalendar() {
    this.calendarDays = [];
    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const d = new Date(currentDate);
      d.setHours(0, 0, 0, 0);
      
      const isToday = d.getTime() === today.getTime();
      const isSelected = d.getTime() === new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()).getTime();
      const isCurrentMonth = d.getMonth() === month;
      const isFutureOrToday = d >= today;
      const hasSlotStr = this.formatDate(d);
      const isAvailable = this.availableDates.has(hasSlotStr);
      
      this.calendarDays.push({
        date: d,
        isActive: isFutureOrToday && isAvailable, // Vrai seulement si >= aujourd'hui et s'il a au moins un slot
        isToday,
        isSelected,
        isCurrentMonth
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  prevMonth() {
    this.currentMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() - 1, 1);
    this.loadMonthAvailabilities();
  }

  nextMonth() {
    this.currentMonthDate = new Date(this.currentMonthDate.getFullYear(), this.currentMonthDate.getMonth() + 1, 1);
    this.loadMonthAvailabilities();
  }

  selectDate(day: any) {
    if (!day.isActive) return;
    this.selectedDate = day.date;
    this.selectedSlot = null; // reset
    this.buildCalendar(); // refresh selected state
    this.loadSlotsForDate(this.selectedDate);
  }

  loadSlotsForDate(date: Date) {
    this.isLoadingSlots = true;
    const dateString = this.formatDate(date);
    this.doctorService.getAvailableSlots(this.doctorId, dateString).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.isLoadingSlots = false;
      },
      error: () => {
        this.availableSlots = [];
        this.isLoadingSlots = false;
      }
    });
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  selectSlot(slot: AvailableSlot) {
    if (slot.status === 'AVAILABLE') {
      this.selectedSlot = slot;
    }
  }

  // --- Booking ---
  openBookingModal() {
    if (!this.selectedSlot) return;
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedReason = '';
    this.customReason = '';
  }

  selectReason(reason: string): void {
    this.selectedReason = this.selectedReason === reason ? '' : reason;
  }

  get finalReason(): string {
    if (this.customReason.trim()) return this.customReason.trim();
    return this.selectedReason;
  }

  confirmBooking() {
    if (!this.selectedSlot || !this.doctor) return;
    this.isBooking = true;
    
    // Assuming backend endpoint /api/v1/appointments
    // Extraire date et times depuis les ISO strings "YYYY-MM-DDTHH:mm:ss"
    const date = this.selectedSlot.startTime.split('T')[0];
    const startTimeTime = this.selectedSlot.startTime.split('T')[1].substring(0, 5); // "09:00"
    const endTimeTime = this.selectedSlot.endTime.split('T')[1].substring(0, 5);     // "09:30"

    const payload = {
      doctorId: this.doctor.id,
      patientId: this.authService.getUserId(), 
      date: date,
      startTime: startTimeTime,
      endTime: endTimeTime,
      mode: this.selectedSlot.mode,
      notes: this.finalReason
    };

    console.log('[DEBUG] PatientDoctorDetailComponent: Submitting booking with payload:', JSON.stringify(payload));
    this.appointmentService.bookAppointment(payload).subscribe({
      next: (response) => {
        console.log('[DEBUG] PatientDoctorDetailComponent: Booking success response:', response);
        this.isBooking = false;
        this.successMessage = 'Rendez-vous réservé avec succès !';
        
        // Refresh local availability so the slot appears greyed out before redirection
        this.loadMonthAvailabilities();
        this.loadSlotsForDate(this.selectedDate);

        setTimeout(() => {
          this.closeBookingModal();
          this.router.navigate(['/front/patient/appointments']);
        }, 1000);
      },
      error: (err) => {
        console.error('[ERROR] PatientDoctorDetailComponent: Booking failed:', err);
        alert('Erreur lors de la réservation. Veuillez réessayer.');
        this.isBooking = false;
      }
    });
  }

  // --- Reviews ---
  setRating(val: number) {
    this.newReviewRating = val;
  }

  submitReview() {
    if (this.newReviewRating === 0 || !this.newReviewComment.trim()) return;
    
    this.isSubmittingReview = true;
    this.reviewService.addReview(this.doctorId, this.newReviewRating, this.newReviewComment).subscribe({
      next: (rev) => {
        this.reviews.unshift(rev);
        this.newReviewRating = 0;
        this.newReviewComment = '';
        this.isSubmittingReview = false;
      },
      error: () => {
        alert('Failed to submit review');
        this.isSubmittingReview = false;
      }
    });
  }
}
