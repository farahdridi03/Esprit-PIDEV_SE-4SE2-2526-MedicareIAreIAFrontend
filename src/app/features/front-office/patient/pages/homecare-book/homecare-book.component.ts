import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HomecareService } from '../../../../../services/homecare.service';
import { HomeCareService, ProviderProfileDTO, CreateServiceRequestDTO } from '../../../../../models/homecare.model';
import { interventionDateValidator, getTodayDateString, getMaxInterventionDateString, getInterventionDateErrorMessage } from '../../../../../validators/intervention-date.validator';

@Component({
  selector: 'app-homecare-book',
  templateUrl: './homecare-book.component.html',
  styleUrls: ['./homecare-book.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomecareBookComponent implements OnInit {
  bookingForm!: FormGroup;
  serviceId!: number;
  serviceDetails?: HomeCareService;
  availableProviders: ProviderProfileDTO[] = [];

  isLoading = true;
  isSubmitting = false;
  error = '';
  success = false;

  // ✅ Date validation properties
  minDate: string = getTodayDateString();
  maxDate: string = getMaxInterventionDateString(90);
  dateErrorMessage: string = '';
  
  // ✅ Provider blocked dates
  blockedProviderDates: string[] = [];
  isLoadingBlockedDates = false;
  
  // ✅ Alert message for blocked/invalid dates
  dateAlertMessage: string = '';
  dateAlertType: 'danger' | 'warning' | '' = '';
  showDateAlert = false;

  // Nouveaux états pour le workflow par créneaux
  availableSlotsSlices: { time: string, label: string }[] = [];
  selectedSlotTime: string | null = null;
  isLoadingSlots = false;

  // Funnel Steps
  currentStep: 'PROVIDER_SELECT' | 'BOOKING_FORM' = 'PROVIDER_SELECT';
  steps = [
    { id: 'PROVIDER_SELECT', label: 'Intervenant', icon: 'bi-person-check' },
    { id: 'BOOKING_FORM', label: 'Planification', icon: 'bi-calendar-event' }
  ];

  // Détails Profil
  selectedProviderProfile: ProviderProfileDTO | null = null;
  isLoadingProfile = false;
  showProfileModal = false;

  // Suggestions de dates
  suggestedDates: { date: string, label: string }[] = [];
  isLoadingSuggestions = false;

  // Nouveautés pour le filtrage initial
  commonHours: string[] = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  get selectedProviderName(): string {
    const id = this.bookingForm.get('providerId')?.value;
    const p = this.availableProviders.find(p => p.id === id);
    return p ? p.fullName : 'Prestataire';
  }

  get selectedProviderRating(): number {
    const id = this.bookingForm.get('providerId')?.value;
    const p = this.availableProviders.find(p => p.id === id);
    return p ? p.averageRating || 0 : 0;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private homecare: HomecareService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['serviceId']) {
        this.serviceId = +params['serviceId'];
        this.loadServiceData();
      } else {
        this.error = 'No service selected.';
        this.isLoading = false;
      }
    });
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      requestedDate: ['', [Validators.required, interventionDateValidator(90)]],
      requestedTime: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(10)]],
      patientNotes: [''],
      providerId: [null, Validators.required]
    });

    // ✅ Monitor date changes to update error message
    this.bookingForm.get('requestedDate')?.valueChanges.subscribe(() => {
      this.updateDateErrorMessage();
      this.onDateTimeChange();
    });
    this.bookingForm.get('requestedTime')?.valueChanges.subscribe(() => this.onDateTimeChange());
  }

  /**
   * ✅ Update the date error message based on validation errors
   */
  updateDateErrorMessage(): void {
    const control = this.bookingForm.get('requestedDate');
    const selectedDate = control?.value;

    console.log('updateDateErrorMessage called. selectedDate:', selectedDate, 'blockedProviderDates:', this.blockedProviderDates);

    // Reset alert
    this.dateAlertMessage = '';
    this.dateAlertType = '';
    this.showDateAlert = false;

    // First check validator errors
    if (control?.invalid && (control?.dirty || control?.touched)) {
      this.dateErrorMessage = getInterventionDateErrorMessage(control.errors);
      console.log('Date validation error:', this.dateErrorMessage);
      this.showDateAlert = true;
      this.dateAlertType = 'danger';
      this.dateAlertMessage = this.dateErrorMessage;
      return;
    }

    // Then check if date is blocked by provider
    if (selectedDate && this.blockedProviderDates.includes(selectedDate)) {
      console.log('Date is blocked!', selectedDate);
      this.dateErrorMessage = '❌ Le prestataire n\'est pas disponible à cette date. Veuillez en choisir une autre.';
      this.showDateAlert = true;
      this.dateAlertType = 'danger';
      this.dateAlertMessage = 'Date bloquée - Ce prestataire n\'est pas disponible le ' + 
                              new Date(selectedDate).toLocaleDateString('fr-FR') + 
                              '. Veuillez sélectionner une autre date.';
      return;
    }

    // No error - hide alert
    this.dateErrorMessage = '';
    this.showDateAlert = false;
  }

  onDateTimeChange(): void {
    const date = this.bookingForm.get('requestedDate')?.value;
    // On ne filtre plus par heure ici, mais on charge les prestataires qui ont au moins un créneau ce jour-là
    if (date) {
      this.isLoadingProviders = true;
      const time = this.bookingForm.get('requestedTime')?.value || '00:00';
      const dateTimeStr = `${date}T${time}:00`;

      this.homecare.getAvailableProviders(this.serviceId, dateTimeStr).subscribe({
        next: (data) => {
          this.availableProviders = data;
          this.isLoadingProviders = false;

          const currentProviderId = this.bookingForm.get('providerId')?.value;
          if (currentProviderId && data.find(p => p.id === currentProviderId)) {
            // Toujours là, on rafraîchit ses créneaux précis si besoin
            this.loadProviderSlots(currentProviderId, date);
          } else {
            this.bookingForm.patchValue({ providerId: null });
            this.availableSlotsSlices = [];
          }
        },
        error: () => {
          this.isLoadingProviders = false;
          this.availableProviders = [];
          this.resetProviderSelection();
        }
      });
    } else {
      this.availableProviders = [];
      this.resetProviderSelection();
    }
  }

  private resetProviderSelection() {
    this.bookingForm.patchValue({ providerId: null, requestedTime: '' });
    this.availableSlotsSlices = [];
    this.selectedSlotTime = null;
  }

  loadProviderSlots(providerId: number, date: string): void {
    this.isLoadingSlots = true;
    this.availableSlotsSlices = [];
    this.selectedSlotTime = null;

    this.homecare.getAvailableSlots(providerId, date, date).subscribe({
      next: (slots) => {
        this.generateSlotSlices(slots);
        this.isLoadingSlots = false;
      },
      error: () => {
        this.isLoadingSlots = false;
      }
    });
  }

  /**
   * ✅ Load blocked/unavailable dates for the selected provider (90 days window)
   */
  loadBlockedDates(providerId: number): void {
    this.isLoadingBlockedDates = true;
    const from = getTodayDateString();
    const maxDate = getMaxInterventionDateString(90);

    console.log('Loading blocked dates from', from, 'to', maxDate, 'for provider', providerId);

    this.homecare.getBlockedDates(providerId, from, maxDate).subscribe({
      next: (blockedDates) => {
        this.blockedProviderDates = blockedDates || [];
        console.log('Blocked dates loaded:', this.blockedProviderDates);
        
        // ✅ TEST: Add a test date if none found to verify functionality
        if (this.blockedProviderDates.length === 0) {
          const testDate = getMaxInterventionDateString(5); // 5 days from now
          this.blockedProviderDates.push(testDate);
          console.log('Added test date:', testDate);
        }
        
        this.isLoadingBlockedDates = false;
        // Re-validate current date if selected
        this.updateDateErrorMessage();
      },
      error: (err) => {
        console.error('Error loading blocked dates:', err);
        this.isLoadingBlockedDates = false;
        this.blockedProviderDates = [];
      }
    });
  }

  private generateSlotSlices(ranges: any[]): void {
    const slices: { time: string, label: string }[] = [];
    const step = 30; // Pas de 30 minutes
    const duration = this.serviceDetails?.durationMinutes || 60;

    ranges.forEach(range => {
      let current = this.parseTime(range.startTime);
      const endLimit = this.parseTime(range.endTime);

      while (this.addMinutes(current, duration) <= endLimit) {
        slices.push({
          time: current,
          label: current
        });
        current = this.addMinutes(current, step);
      }
    });

    this.availableSlotsSlices = slices;
  }

  private parseTime(t: string): string {
    return t.substring(0, 5); // "HH:mm"
  }

  private addMinutes(timeStr: string, minutes: number): string {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toTimeString().substring(0, 5);
  }

  selectSlot(time: string): void {
    this.selectedSlotTime = time;
    this.bookingForm.patchValue({ requestedTime: time });
  }

  isLoadingProviders = false;

  loadServiceData(): void {
    // We fetch all services and filter. In a real app, you'd have getServiceById.
    this.homecare.getAllServices().subscribe({
      next: (services) => {
        this.serviceDetails = services.find(s => s.id === this.serviceId);
        if (!this.serviceDetails) {
          this.error = 'Service not found.';
          this.isLoading = false;
        }
        this.loadProviders();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load service details.';
        this.isLoading = false;
      }
    });
  }

  loadProviders(): void {
    this.homecare.getProvidersByService(this.serviceId).subscribe({
      next: (data) => {
        this.availableProviders = data;
        if (data.length === 0) {
          this.bookingForm.get('providerId')?.clearValidators();
          this.bookingForm.get('providerId')?.updateValueAndValidity();
        }
        this.isLoading = false;
      },
      error: () => {
        this.bookingForm.get('providerId')?.clearValidators();
        this.bookingForm.get('providerId')?.updateValueAndValidity();
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const formValues = this.bookingForm.value;
    const dateTimeStr = `${formValues.requestedDate}T${formValues.requestedTime}:00`;

    const requestDto: CreateServiceRequestDTO = {
      serviceId: this.serviceId,
      requestedDateTime: dateTimeStr,
      address: formValues.address,
      patientNotes: formValues.patientNotes,
      providerId: formValues.providerId
    };

    this.homecare.createRequest(requestDto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/front/patient/homecare/my-requests']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to submit the booking request.';
        this.isSubmitting = false;
      }
    });
  }

  get f() {
    return this.bookingForm.controls;
  }

  selectProviderAndNext(id: number): void {
    // Fermer le profil s'il est ouvert
    this.closeProfileModal();

    this.isLoadingSlots = true;
    this.bookingForm.patchValue({ providerId: id });

    // ✅ Load blocked dates for this provider
    this.loadBlockedDates(id);

    setTimeout(() => {
      this.currentStep = 'BOOKING_FORM';
      this.isLoadingSlots = false;

      const date = this.bookingForm.get('requestedDate')?.value;
      if (date) {
        this.loadProviderSlots(id, date);
      } else {
        this.loadSuggestedDates(id);
      }
    }, 400);
  }

  backToProviders(): void {
    this.currentStep = 'PROVIDER_SELECT';
    this.bookingForm.patchValue({ providerId: null });
    this.availableSlotsSlices = [];
    this.selectedSlotTime = null;
  }

  loadSuggestedDates(providerId: number): void {
    this.isLoadingSuggestions = true;
    this.suggestedDates = [];
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const end = nextMonth.toISOString().split('T')[0];

    this.homecare.getAvailableSlots(providerId, today, end).subscribe({
      next: (slots) => {
        // Extraire les dates uniques qui ont des créneaux
        const uniqueDates = Array.from(new Set(slots.map(s => s.date))).slice(0, 5);
        this.suggestedDates = uniqueDates.map(d => ({
          date: d,
          label: new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        }));
        this.isLoadingSuggestions = false;
      },
      error: () => this.isLoadingSuggestions = false
    });
  }

  selectSuggestedDate(date: string): void {
    this.bookingForm.patchValue({ requestedDate: date });
    const providerId = this.bookingForm.get('providerId')?.value;
    if (providerId) {
      this.loadProviderSlots(providerId, date);
    }
  }

  viewProviderProfile(id: number): void {
    this.isLoadingProfile = true;
    this.showProfileModal = true;
    this.homecare.getProviderProfile(id).subscribe({
      next: (profile) => {
        this.selectedProviderProfile = profile;
        this.isLoadingProfile = false;
      },
      error: () => {
        this.isLoadingProfile = false;
        this.showProfileModal = false;
        this.error = 'Impossible de charger le profil de ce prestataire.';
      }
    });
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    this.selectedProviderProfile = null;
  }
}
