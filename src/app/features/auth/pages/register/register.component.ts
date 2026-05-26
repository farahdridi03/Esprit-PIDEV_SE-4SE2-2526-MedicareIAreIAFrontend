import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { HomecareService } from '../../../../services/homecare.service';
import { HomeCareService } from '../../../../models/homecare.model';
import { Router } from '@angular/router';
import { ClinicService, Clinic } from '../../../../services/clinic.service';
import { birthDateValidator, getEighteenYearsAgoDate } from '../../../../validators/birth-date.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  errorMessage: string = '';
  profileImageBase64: string | null = null;
  selectedFile: File | null = null;
  eighteenYearsAgoDate: string = '';

  roles = [
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'CLINIC', label: 'Clinic' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LABORATORY_STAFF', label: 'Laboratory Staff' },
    { value: 'PATIENT', label: 'Patient' },
    { value: 'NUTRITIONIST', label: 'Nutritionist' },
    { value: 'HOME_CARE_PROVIDER', label: 'Home Care Provider' },
    { value: 'ADMIN', label: 'Administrator' }
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

  consultationModes = [
    { value: 'ONLINE', label: 'Online' },
    { value: 'IN_PERSON', label: 'In Person' },
    { value: 'BOTH', label: 'Both' }
  ];

  doctorSpecialties = [
    { value: 'CARDIOLOGY', label: 'Cardiology' },
    { value: 'DERMATOLOGY', label: 'Dermatology' },
    { value: 'PEDIATRICS', label: 'Pediatrics' },
    { value: 'GENERAL_MEDICINE', label: 'General Medicine' },
    { value: 'OPHTHALMOLOGY', label: 'Ophthalmology' },
    { value: 'ORTHOPEDICS', label: 'Orthopedics' },
    { value: 'NEUROLOGY', label: 'Neurology' },
    { value: 'PSYCHIATRY', label: 'Psychiatry' },
    { value: 'GASTROENTEROLOGY', label: 'Gastroenterology' },
    { value: 'RADIOLOGY', label: 'Radiology' }
  ];

  homeCareServicesList: any[] = [];
  availableSpecialties: HomeCareService[] = [];
  clinics: Clinic[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clinicService: ClinicService,
    private homecareService: HomecareService,
    private router: Router
  ) {
    this.eighteenYearsAgoDate = getEighteenYearsAgoDate();

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      birthDate: ['', [Validators.required, birthDateValidator()]],
      role: ['PATIENT', Validators.required],
      gender: ['MALE'],
      bloodType: ['O_POS'],
      emergencyContactName: [''],
      emergencyContactPhone: ['', [Validators.pattern('^[0-9]{8,15}$')]],
      height: [null],
      weight: [null],
      chronicDiseases: [''],
      drugAllergies: [''],
      hereditaryDiseases: [''],
      specialty: [''],
      licenseNumber: [''],
      consultationFee: [0],
      consultationMode: ['BOTH'],
      clinicId: [null],
      clinicName: [''],
      clinicAddress: [''],
      clinicPhone: ['', [Validators.pattern('^[0-9]{8,15}$')]],
      emergencyPhone: ['', [Validators.pattern('^[0-9]{3,15}$')]],
      ambulancePhone: ['', [Validators.pattern('^[0-9]{3,15}$')]],
      pharmacyName: [''],
      pharmacyAddress: [''],
      pharmacyPhone: ['', [Validators.pattern('^[0-9]{8,15}$')]],
      pharmacyEmail: ['', [Validators.email]],
      labName: [''],
      labAddress: [''],
      labPhone: ['', [Validators.pattern('^[0-9]{8,15}$')]],
      certificationDocument: [''],
      selectedServices: this.fb.array([]),
      specialtyIds: [[]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
      profileImage: [null]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  ngOnInit() {
    this.onRoleChange();
    this.loadHomeCareServices();
    this.loadClinics();
  }

  loadClinics() {
    this.clinicService.getAllClinics().subscribe({
      next: (data: Clinic[]) => this.clinics = data,
      error: (err: any) => console.error('Error loading clinics', err)
    });
  }

  loadHomeCareServices() {
    this.authService.getHomeCareServices().subscribe({
      next: (services) => {
        this.availableSpecialties = services;
        this.homeCareServicesList = services;
      },
      error: (err) => {
        console.error('Error loading home care services', err);
      }
    });
  }

  onRoleChange() {
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const isPatient = role === 'PATIENT';
      const isDoctor = role === 'DOCTOR';
      const isNutritionist = role === 'NUTRITIONIST';
      const isClinic = role === 'CLINIC';
      const isPharmacist = role === 'PHARMACIST';
      const isLabStaff = role === 'LABORATORY_STAFF' || role === 'LABORATORY';
      const isHomeCare = role === 'HOME_CARE_PROVIDER';
      const isAdmin = role === 'ADMIN';

      const genderCtrl = this.registerForm.get('gender');
      const bloodTypeCtrl = this.registerForm.get('bloodType');
      const emNameCtrl = this.registerForm.get('emergencyContactName');
      const emPhoneCtrl = this.registerForm.get('emergencyContactPhone');
      const heightCtrl = this.registerForm.get('height');
      const weightCtrl = this.registerForm.get('weight');
      const birthDateCtrl = this.registerForm.get('birthDate');
      const specialtyCtrl = this.registerForm.get('specialty');
      const licenseCtrl = this.registerForm.get('licenseNumber');
      const feeCtrl = this.registerForm.get('consultationFee');
      const modeCtrl = this.registerForm.get('consultationMode');
      const clinicIdCtrl = this.registerForm.get('clinicId');
      const clinicNameCtrl = this.registerForm.get('clinicName');
      const pharmacyNameCtrl = this.registerForm.get('pharmacyName');
      const certDocCtrl = this.registerForm.get('certificationDocument');
      const specialtyIdsCtrl = this.registerForm.get('specialtyIds');
      const labNameCtrl = this.registerForm.get('labName');
      const docClinicAddressCtrl = this.registerForm.get('clinicAddress');

      // Clear all dynamic validators first
      const controls = [
        genderCtrl, bloodTypeCtrl, emNameCtrl, emPhoneCtrl, heightCtrl, weightCtrl,
        specialtyCtrl, licenseCtrl, feeCtrl, modeCtrl, clinicIdCtrl,
        clinicNameCtrl, pharmacyNameCtrl, certDocCtrl, specialtyIdsCtrl, birthDateCtrl, labNameCtrl, docClinicAddressCtrl
      ];

      controls.forEach(ctrl => {
        ctrl?.clearValidators();
      });

      if (!isClinic && !isLabStaff && !isAdmin) {
        birthDateCtrl?.setValidators([Validators.required, birthDateValidator()]);
      }

      if (isPatient) {
        genderCtrl?.setValidators([Validators.required]);
        bloodTypeCtrl?.setValidators([Validators.required]);
        emNameCtrl?.setValidators([Validators.required]);
        emPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8,15}$')]);
        heightCtrl?.setValidators([Validators.required, Validators.min(0)]);
        weightCtrl?.setValidators([Validators.required, Validators.min(0)]);
      } else if (isDoctor || isNutritionist) {
        specialtyCtrl?.setValidators([Validators.required]);
        licenseCtrl?.setValidators([Validators.required]);
        feeCtrl?.setValidators([Validators.required, Validators.min(0)]);
        modeCtrl?.setValidators([Validators.required]);
        if (isDoctor) {
          docClinicAddressCtrl?.setValidators([Validators.required]);
        }
      } else if (isClinic) {
        clinicNameCtrl?.setValidators([Validators.required]);
      } else if (isPharmacist) {
        pharmacyNameCtrl?.setValidators([Validators.required]);
        certDocCtrl?.setValidators([Validators.required]);
      } else if (isHomeCare) {
        certDocCtrl?.setValidators([Validators.required]);
        specialtyIdsCtrl?.setValidators([Validators.required]);
      } else if (isLabStaff) {
        labNameCtrl?.setValidators([Validators.required]);
      }

      controls.forEach(ctrl => ctrl?.updateValueAndValidity());
    });
  }

  get isPatient(): boolean { return this.registerForm.get('role')?.value === 'PATIENT'; }
  get isDoctor(): boolean { return this.registerForm.get('role')?.value === 'DOCTOR'; }
  get isClinic(): boolean { return this.registerForm.get('role')?.value === 'CLINIC'; }
  get isPharmacist(): boolean { return this.registerForm.get('role')?.value === 'PHARMACIST'; }
  get isLabStaff(): boolean { return this.registerForm.get('role')?.value === 'LABORATORY_STAFF' || this.registerForm.get('role')?.value === 'LABORATORY'; }
  get isNutritionist(): boolean { return this.registerForm.get('role')?.value === 'NUTRITIONIST'; }
  get isHomeCareProvider(): boolean { return this.registerForm.get('role')?.value === 'HOME_CARE_PROVIDER'; }
  get isAdmin(): boolean { return this.registerForm.get('role')?.value === 'ADMIN'; }

  get selectedServices(): FormArray {
    return this.registerForm.get('selectedServices') as FormArray;
  }

  onServiceChange(e: any) {
    const checkArray: FormArray = this.registerForm.get('selectedServices') as FormArray;
    if (e.target.checked) {
      checkArray.push(this.fb.control(e.target.value));
    } else {
      let i: number = 0;
      checkArray.controls.forEach((item: any) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
    checkArray.updateValueAndValidity();
    
    // Also sync with specialtyIds control for validation
    this.registerForm.patchValue({ specialtyIds: checkArray.value });
    this.registerForm.get('specialtyIds')?.markAsTouched();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size > 2 * 1024 * 1024) {
          this.errorMessage = 'La taille de l\'image ne doit pas dépasser 2Mo.';
          return;
        }
        this.errorMessage = '';
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profileImageBase64 = e.target.result;
          this.registerForm.patchValue({ profileImage: this.profileImageBase64 });
        };
        reader.readAsDataURL(file);
      } else {
        // Handle document files for Pharmacist/Provider
        this.selectedFile = file;
        this.registerForm.patchValue({ certificationDocument: file.name });
      }
    }
  }

  onFileChange(event: any) {
    this.onFileSelected(event);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      const role = formValue.role;

      // Cleanup payload - remove internal form fields
      const { terms, confirmPassword, selectedServices, certificationDocument, ...payload } = formValue;

      // Remove empty strings and nulls to prevent backend validation errors on irrelevant fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === null) {
          delete payload[key];
        }
      });

      const finalPayload = {
        ...payload,
        homeCareServices: role === 'HOME_CARE_PROVIDER' ? selectedServices : undefined
      };

      const formData = new FormData();
      formData.append('user', JSON.stringify(finalPayload));

      if (this.selectedFile) {
        formData.append('document', this.selectedFile);
      }

      this.executeRegistration(formData);
    } else {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all required fields correctly. (Check the console for details on which fields are invalid)';
      console.log('--- INVALID FORM DETECTED ---');
      Object.keys(this.registerForm.controls).forEach(key => {
        const controlErrors: any = this.registerForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Invalid field:', key, 'Errors:', controlErrors);
        }
      });
    }
  }

  executeRegistration(formData: FormData) {
    this.authService.register(formData).subscribe({
      next: () => {
        alert('Inscription réussie !');
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        console.error('Registration error:', err);
        let msg = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        // Attempt to parse stringified JSON if the response is a string
        if (typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            msg = parsed.error || parsed.message || msg;
          } catch (e) {
            msg = err.error || msg;
          }
        } else if (err.error) {
          msg = err.error.error || err.error.message || msg;
        }

        this.errorMessage = msg;
      }
    });
  }

  getBirthDateErrorMessage(): string {
    const control = this.registerForm.get('birthDate');
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Date of birth is required';
    if (control.errors['futureDate']) return 'Date of birth cannot be in the future';
    if (control.errors['minAge']) return `You must be at least ${control.errors['minAge'].requiredAge} years old`;
    return 'Invalid date';
  }
}