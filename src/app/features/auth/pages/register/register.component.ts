import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { FileUploadService } from '../../../../services/file-upload.service';
import { HomecareService } from '../../../../services/homecare.service';
import { HomeCareService } from '../../../../models/homecare.model';
import { Router } from '@angular/router';
import { birthDateValidator, getBirthDateErrorMessage, getEighteenYearsAgoDate } from '../../../../validators/birth-date.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';
  selectedFile: File | null = null;
  eighteenYearsAgoDate: string = '';

  roles = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'CLINIC', label: 'Clinic' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LABORATORY', label: 'Laboratory' },
    { value: 'NUTRITIONIST', label: 'Nutritionist' },
    { value: 'VISITOR', label: 'Visitor' },
    { value: 'PATIENT', label: 'Patient' },
    { value: 'HOME_CARE_PROVIDER', label: 'Home Care Provider' }
  ];

  bloodTypes = [
    { value: 'A_POS', label: 'A+' },
    { value: 'A_NEG', label: 'A-' },
    { value: 'B_POS', label: 'B+' },
    { value: 'B_NEG', label: 'B-' },
    { value: 'AB_POS', label: 'AB+' },
    { value: 'AB_NEG', label: 'AB-' },
    { value: 'O_POS', label: 'O+' },
    { value: 'O_NEG', label: 'O-' }
  ];

  genders = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  availableSpecialties: HomeCareService[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private homecareService: HomecareService,
    private router: Router
  ) {
    // Calculer la date limite (18 ans ago)
    this.eighteenYearsAgoDate = getEighteenYearsAgoDate();

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      birthDate: ['', [Validators.required, birthDateValidator()]],
      role: ['PATIENT', Validators.required],
      gender: ['MALE'],
      bloodType: ['O_POS'],
      emergencyContactName: [''],
      emergencyContactPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      chronicDiseases: [''],
      drugAllergies: [''],
      hereditaryDiseases: [''],
      // Pharmacist fields
      pharmacyName: [''],
      pharmacyAddress: [''],
      pharmacyPhone: [''],
      // Provider / Pharmacist document
      certificationDocument: [''],
      // Provider specialty
      specialtyIds: [[]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, Validators.requiredTrue]
    });

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const isPatient = role === 'PATIENT';
      const isPharmacist = role === 'PHARMACIST';
      const genderCtrl = this.registerForm.get('gender');
      const bloodTypeCtrl = this.registerForm.get('bloodType');
      const emNameCtrl = this.registerForm.get('emergencyContactName');
      const emPhoneCtrl = this.registerForm.get('emergencyContactPhone');
      const certCtrl = this.registerForm.get('certificationDocument');
      const pharmacyNameCtrl = this.registerForm.get('pharmacyName');
      const specialtyIdsCtrl = this.registerForm.get('specialtyIds');

      if (isPatient) {
        genderCtrl?.setValidators([Validators.required]);
        bloodTypeCtrl?.setValidators([Validators.required]);
        emNameCtrl?.setValidators([Validators.required]);
        emPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        pharmacyNameCtrl?.clearValidators();
      } else if (isPharmacist) {
        genderCtrl?.clearValidators();
        bloodTypeCtrl?.clearValidators();
        emNameCtrl?.clearValidators();
        emPhoneCtrl?.clearValidators();
        pharmacyNameCtrl?.setValidators([Validators.required]);
      } else {
        genderCtrl?.clearValidators();
        bloodTypeCtrl?.clearValidators();
        emNameCtrl?.clearValidators();
        emPhoneCtrl?.clearValidators();
        pharmacyNameCtrl?.clearValidators();
      }

      if (role === 'HOME_CARE_PROVIDER') {
        certCtrl?.setValidators([Validators.required]);
        specialtyIdsCtrl?.setValidators([Validators.required]);
      } else {
        certCtrl?.clearValidators();
        specialtyIdsCtrl?.clearValidators();
      }

      genderCtrl?.updateValueAndValidity();
      bloodTypeCtrl?.updateValueAndValidity();
      emNameCtrl?.updateValueAndValidity();
      emPhoneCtrl?.updateValueAndValidity();
      certCtrl?.updateValueAndValidity();
      pharmacyNameCtrl?.updateValueAndValidity();
      specialtyIdsCtrl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.homecareService.getAllServices().subscribe({
      next: (services) => {
        this.availableSpecialties = services;
      },
      error: (err) => {
        console.error('Error fetching home care services', err);
      }
    });
  }

  get isPatient(): boolean {
    return this.registerForm.get('role')?.value === 'PATIENT';
  }

  get isProvider(): boolean {
    return this.registerForm.get('role')?.value === 'HOME_CARE_PROVIDER';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.registerForm.patchValue({ certificationDocument: file.name });
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Retirer les champs locaux (terms, certificationDocument brut) du payload JSON
      const { terms, certificationDocument, ...payload } = this.registerForm.value;

      // Ensure specialtyIds is an array of numbers for HOME_CARE_PROVIDER
      if (payload.role === 'HOME_CARE_PROVIDER') {
        if (payload.specialtyIds && !Array.isArray(payload.specialtyIds)) {
          payload.specialtyIds = [Number(payload.specialtyIds)];
        } else if (!payload.specialtyIds) {
          payload.specialtyIds = [];
        }
      } else {
        // Pour les autres rôles (Pharmacien, Patient), on envoie soit un tableau vide, soit on retire le champ
        payload.specialtyIds = [];
      }

      const formData = new FormData();
      formData.append('user', JSON.stringify(payload));

      if (this.selectedFile && (payload.role === 'HOME_CARE_PROVIDER' || payload.role === 'PHARMACIST')) {
        formData.append('document', this.selectedFile);
      }

      this.executeRegistration(formData);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  executeRegistration(formData: FormData) {
    this.authService.register(formData).subscribe({
      next: () => {
        console.log('Registration successful');
        const role = this.registerForm.get('role')?.value;
        if (role === 'HOME_CARE_PROVIDER' || role === 'PHARMACIST') {
          alert('Inscription réussie. Votre compte est en attente de vérification par un administrateur.');
        }
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        console.error('Registration error details:', err.error);

        let details = 'Erreur lors de l\'inscription';
        // Parse custom error message since the request has responseType: 'text'
        if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            details = parsed.error || parsed.message || details;
          } catch (e) {
            details = err.error || details; // Fallback to raw text
          }
        } else if (err.error && typeof err.error === 'object') {
          details = err.error.error || err.error.message || details;
        }

        this.errorMessage = details;
      }
    });
  }

  /**
   * Get birth date error message in French
   */
  getBirthDateErrorMessage(): string {
    const control = this.registerForm.get('birthDate');
    if (!control || !control.errors) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return 'La date de naissance est obligatoire';
    }

    if (errors['futureDate']) {
      return 'La date de naissance ne peut pas être dans le futur';
    }

    if (errors['minAge']) {
      const requiredAge = errors['minAge'].requiredAge;
      const actualAge = errors['minAge'].actualAge;
      return `Vous devez avoir au moins ${requiredAge} ans (vous avez actuellement ${actualAge} ans)`;
    }

    if (errors['maxAge']) {
      return 'La date de naissance semble invalide';
    }

    return 'Erreur de validation de la date';
  }
}