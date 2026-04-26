import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../../../services/event.service';
import { MedicalEvent } from '../../../../../models/event.model';
import { AuthService } from '../../../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';

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
  // UI
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  // Venue Autocomplete
  venueSuggestions: any[] = [];
  searchingVenue = false;
  private venueSearchSubject = new Subject<string>();

  countries = [
    'Tunisia', 'France', 'USA', 'Germany', 'United Kingdom', 'Canada', 
    'Japan', 'United Arab Emirates', 'Saudi Arabia', 'Morocco', 'Algeria',
    'Turkey', 'Italy', 'Spain', 'Switzerland', 'Qatar'
  ];

  tunisianCities = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 
    'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 
    'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 
    'Gabès', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ];

  internationalCities = [
    'Paris', 'Lyon', 'Marseille', 'Nice', 'New York', 'Los Angeles', 'Chicago',
    'London', 'Manchester', 'Berlin', 'Munich', 'Frankfurt', 'Dubai', 
    'Riyadh', 'Casablanca', 'Algiers', 'Oran', 'Constantine', 'Annaba', 
    'Istanbul', 'Tokyo', 'Montreal'
  ];

  // Map to automatically set country based on city
  cityToCountryMap: { [key: string]: string } = {
    'Tunis': 'Tunisia', 'Ariana': 'Tunisia', 'Ben Arous': 'Tunisia', 'Manouba': 'Tunisia', 
    'Nabeul': 'Tunisia', 'Zaghouan': 'Tunisia', 'Bizerte': 'Tunisia', 'Béja': 'Tunisia', 
    'Jendouba': 'Tunisia', 'Le Kef': 'Tunisia', 'Siliana': 'Tunisia', 'Sousse': 'Tunisia', 
    'Monastir': 'Tunisia', 'Mahdia': 'Tunisia', 'Sfax': 'Tunisia', 'Kairouan': 'Tunisia', 
    'Kasserine': 'Tunisia', 'Sidi Bouzid': 'Tunisia', 'Gabès': 'Tunisia', 'Medenine': 'Tunisia', 
    'Tataouine': 'Tunisia', 'Gafsa': 'Tunisia', 'Tozeur': 'Tunisia', 'Kebili': 'Tunisia',
    'Paris': 'France', 'Lyon': 'France', 'Marseille': 'France', 'Nice': 'France',
    'New York': 'USA', 'Los Angeles': 'USA', 'Chicago': 'USA',
    'London': 'United Kingdom', 'Manchester': 'United Kingdom',
    'Berlin': 'Germany', 'Munich': 'Germany', 'Frankfurt': 'Germany',
    'Dubai': 'United Arab Emirates', 'Riyadh': 'Saudi Arabia',
    'Casablanca': 'Morocco', 'Algiers': 'Algeria', 'Oran': 'Algeria', 'Constantine': 'Algeria', 'Annaba': 'Algeria',
    'Istanbul': 'Turkey', 'Tokyo': 'Japan', 'Montreal': 'Canada'
  };

  // Lists of cities per country
  citiesByCountryMap: { [key: string]: string[] } = {
    'Tunisia': ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'],
    'France': ['Paris', 'Lyon', 'Marseille', 'Nice'],
    'USA': ['New York', 'Los Angeles', 'Chicago'],
    'Germany': ['Berlin', 'Munich', 'Frankfurt'],
    'United Kingdom': ['London', 'Manchester'],
    'Canada': ['Montreal', 'Toronto', 'Vancouver'],
    'United Arab Emirates': ['Dubai', 'Abu Dhabi'],
    'Saudi Arabia': ['Riyadh', 'Jeddah'],
    'Morocco': ['Casablanca', 'Rabat', 'Marrakesh'],
    'Algeria': ['Algiers', 'Oran', 'Constantine', 'Annaba'],
    'Turkey': ['Istanbul', 'Ankara', 'Izmir'],
    'Japan': ['Tokyo', 'Osaka', 'Kyoto'],
    'Italy': ['Rome', 'Milan', 'Venice'],
    'Spain': ['Madrid', 'Barcelona', 'Seville'],
    'Switzerland': ['Bern', 'Zurich', 'Geneva'],
    'Qatar': ['Doha']
  };

  // Map to automatically set a default city when a country is selected
  countryToDefaultCityMap: { [key: string]: string } = {
    'Tunisia': 'Tunis', 'France': 'Paris', 'USA': 'New York', 'Germany': 'Berlin',
    'United Kingdom': 'London', 'Canada': 'Montreal', 'United Arab Emirates': 'Dubai',
    'Saudi Arabia': 'Riyadh', 'Morocco': 'Casablanca', 'Algeria': 'Algiers',
    'Turkey': 'Istanbul', 'Japan': 'Tokyo', 'Italy': 'Rome', 'Spain': 'Madrid',
    'Switzerland': 'Bern', 'Qatar': 'Doha'
  };
  
  // Tunisian Postal codes per city (approximate defaults)
  cityToPostalCodeMap: { [key: string]: string } = {
    'Tunis': '1000', 'Ariana': '2080', 'Ben Arous': '2013', 'Manouba': '2010',
    'Nabeul': '8000', 'Sousse': '4000', 'Monastir': '5000', 'Mahdia': '5100',
    'Sfax': '3000', 'Bizerte': '7000', 'Béja': '9000', 'Jendouba': '8100',
    'Le Kef': '7100', 'Siliana': '6100', 'Kairouan': '3100', 'Kasserine': '1200',
    'Sidi Bouzid': '9100', 'Gabès': '6000', 'Medenine': '4100', 'Tataouine': '3200',
    'Gafsa': '2100', 'Tozeur': '2200', 'Kebili': '4200', 'Zaghouan': '1100'
  };

  allCities = [...this.tunisianCities, ...this.internationalCities].sort();

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.initVenueSearch();
  }

  private initVenueSearch() {
    this.venueSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) return of([]);
        this.searchingVenue = true;
        return this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=tn&limit=5`)
          .pipe(finalize(() => this.searchingVenue = false));
      })
    ).subscribe(results => this.venueSuggestions = results);
  }

  onVenueInput(event: any) {
    this.venueSearchSubject.next(event.target.value);
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    return `http://localhost:8081/uploads/${imagePath}`;
  }

  selectVenue(venue: any) {
    const addr = venue.address;
    let addressLine = addr.house_number ? addr.house_number + ' ' : '';
    addressLine += addr.road || venue.display_name.split(',')[0];
    const city = addr.city || addr.town || addr.village || '';
    
    this.eventForm.patchValue({
      venueName: venue.display_name.split(',')[0],
      address: addressLine,
      city: city,
      country: addr.country || '',
      postalCode: addr.postcode || ''
    });
    this.venueSuggestions = [];
  }

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
      venueName: [''], address: [''], city: [''], postalCode: [''], country: ['Tunisia'], capacity: [''],
      platformName: [''], meetingLink: [''], meetingPassword: [''],
      imageUrl: ['']
    });

    this.eventForm.get('eventType')?.valueChanges.subscribe(val => this.updateValidators(val));
    
    this.eventForm.get('country')?.valueChanges.subscribe(country => {
      const defaultCity = this.countryToDefaultCityMap[country];
      if (defaultCity) this.eventForm.patchValue({ city: defaultCity }, { emitEvent: false });
    });

    this.eventForm.get('city')?.valueChanges.subscribe(city => {
      const country = this.cityToCountryMap[city];
      if (country) this.eventForm.patchValue({ country: country }, { emitEvent: false });
      const postCode = this.cityToPostalCodeMap[city];
      if (postCode) this.eventForm.patchValue({ postalCode: postCode }, { emitEvent: false });
    });
  }

  updateValidators(type: string) {
    const physical = ['venueName', 'address', 'city', 'country'];
    const online = ['platformName', 'meetingLink'];
    if (type === 'PHYSICAL') {
      physical.forEach(c => this.eventForm.get(c)?.setValidators(Validators.required));
      online.forEach(c => this.eventForm.get(c)?.clearValidators());
    } else {
      online.forEach(c => this.eventForm.get(c)?.setValidators(Validators.required));
      physical.forEach(c => this.eventForm.get(c)?.clearValidators());
    }
    Object.keys(this.eventForm.controls).forEach(k => this.eventForm.get(k)?.updateValueAndValidity({ emitEvent: false }));
  }

  loadEvent() {
    if (!this.eventId) return;
    this.loading = true;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (ev) => {
        const formattedDate = ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '';
        this.eventForm.patchValue({ ...ev, date: formattedDate });
        if (ev.imageUrl) this.imagePreview = this.getImageUrl(ev.imageUrl);
        this.updateValidators(ev.eventType);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.imagePreview = base64;
        this.eventForm.patchValue({ imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  removePreview() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.eventForm.patchValue({ imageUrl: '' });
  }

  saveEvent() {
    if (this.eventForm.invalid) return;
    
    this.loading = true;
    const formValue = { ...this.eventForm.value };
    
    // Clear irrelevant fields before sending
    if (formValue.eventType === 'PHYSICAL') {
      formValue.platformName = null;
      formValue.meetingLink = null;
      formValue.meetingPassword = null;
    } else {
      formValue.venueName = null;
      formValue.address = null;
      formValue.city = null;
      formValue.postalCode = null;
      formValue.country = null;
      formValue.capacity = null;
    }

    const u = JSON.parse(localStorage.getItem('user') || '{}');
    formValue.createdById = u.id || 1;
    
    // Remove imageUrl from the object being sent in the 'event' part
    delete formValue.imageUrl;

    // Use FormData for multipart submission
    const formData = new FormData();
    
    // The backend expects a part named 'event' as a JSON string with application/json type
    const eventBlob = new Blob([JSON.stringify(formValue)], { type: 'application/json' });
    formData.append('event', eventBlob);

    // The backend expects a part named 'image' as the file
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = (this.isEditMode && this.eventId)
      ? this.eventService.updateEvent(this.eventId, formData)
      : this.eventService.createEvent(formData);

    request.subscribe({
      next: (res) => {
        console.log('Event processing complete!', res);
        this.router.navigate(['/admin/events']);
      },
      error: (err) => {
        console.error('Error:', err);
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    console.error(err);
    this.loading = false;
    if (err.error && typeof err.error === 'object' && !err.error.message) {
      // Assuming validation errors as Map<String, String>
      Object.keys(err.error).forEach(k => {
        const control = this.eventForm.get(k);
        if (control) {
          control.setErrors({ serverError: err.error[k] });
        }
      });
    } else {
      this.globalError = err.error?.message || 'Failed to save event.';
    }
  }
}
