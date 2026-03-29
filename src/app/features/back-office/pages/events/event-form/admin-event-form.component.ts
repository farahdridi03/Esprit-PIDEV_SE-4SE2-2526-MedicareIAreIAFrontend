import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../../services/event.service';
import { MedicalEvent } from '../../../../../models/event.model';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-admin-event-form',
  templateUrl: './admin-event-form.component.html',
  styleUrls: ['./admin-event-form.component.scss']
})
export class AdminEventFormComponent implements OnInit {
  eventForm!: FormGroup;
  eventId?: number;
  isEditMode = false;
  loading = false;
  globalError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForm();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.eventId = +id;
        this.isEditMode = true;
        this.loadEvent();
      }
    });
  }

  initForm() {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      eventType: ['PHYSICAL', Validators.required],
      
      // Physical
      venueName: [''],
      address: [''],
      city: [''],
      postalCode: [''],
      country: [''],
      capacity: [''],
      
      // Online
      platformName: [''],
      meetingLink: [''],
      meetingPassword: ['']
    });

    this.eventForm.get('eventType')?.valueChanges.subscribe(value => {
      this.updateValidators(value);
    });
  }

  updateValidators(type: string) {
    const physicalControls = ['venueName', 'address', 'city', 'country'];
    const onlineControls = ['platformName', 'meetingLink'];

    if (type === 'PHYSICAL') {
      physicalControls.forEach(ctrl => this.eventForm.get(ctrl)?.setValidators(Validators.required));
      onlineControls.forEach(ctrl => this.eventForm.get(ctrl)?.clearValidators());
    } else {
      onlineControls.forEach(ctrl => this.eventForm.get(ctrl)?.setValidators(Validators.required));
      physicalControls.forEach(ctrl => this.eventForm.get(ctrl)?.clearValidators());
    }

    Object.keys(this.eventForm.controls).forEach(key => this.eventForm.get(key)?.updateValueAndValidity());
  }

  loadEvent() {
    if (!this.eventId) return;
    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (ev) => {
        // format date for datetime-local input
        const formattedDate = ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '';
        this.eventForm.patchValue({ ...ev, date: formattedDate });
        // The valueChanges subscription will trigger updateValidators implicitly
        this.updateValidators(ev.eventType);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  saveEvent() {
    if (this.eventForm.invalid) return;
    
    this.loading = true;
    const formData = { ...this.eventForm.value };
    
    // Clear irrelevant fields before sending
    if (formData.eventType === 'PHYSICAL') {
      formData.platformName = null;
      formData.meetingLink = null;
      formData.meetingPassword = null;
    } else {
      formData.venueName = null;
      formData.address = null;
      formData.city = null;
      formData.postalCode = null;
      formData.country = null;
      formData.capacity = null;
    }

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, formData).subscribe({
        next: () => this.router.navigate(['/admin/events']),
        error: (err) => this.handleError(err)
      });
    } else {
      // Create mode
      const userStr = localStorage.getItem('user'); // Or from AuthService if available
      let createdById = 1;
      if (userStr) {
        const u = JSON.parse(userStr);
        createdById = u.id || 1;
      }
      formData.createdById = createdById;

      this.eventService.createEvent(formData).subscribe({
        next: () => this.router.navigate(['/admin/events']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    console.error(err);
    this.loading = false;
    this.globalError = null;

    if (err.error?.fields) {
      Object.keys(err.error.fields).forEach(key => {
        const control = this.eventForm.get(key);
        if (control) {
          control.setErrors({ serverError: err.error.fields[key] });
        }
      });
    } else if (err.error?.message) {
      this.globalError = err.error.message;
    } else {
      this.globalError = 'Failed to save event.';
    }
  }
}
