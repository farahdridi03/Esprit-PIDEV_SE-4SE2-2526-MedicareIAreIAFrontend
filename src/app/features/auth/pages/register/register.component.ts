import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { ClinicService, Clinic } from '../../../../services/clinic.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';

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
  clinics: Clinic[] = [];
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clinicService: ClinicService,
    private router: Router
    // ✅ PatientService supprimé — on utilise authService pour tout
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      birthDate: ['', Validators.required],
      role: ['PATIENT', Validators.required],
      gender: ['MALE'],
      bloodType: ['O_POS'],
      emergencyContactName: [''],
      emergencyContactPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      chronicDiseases: [''],
      drugAllergies: [''],
      hereditaryDiseases: [''],
      specialty: [''],
      licenseNumber: [''],
      consultationFee: [0],
      consultationMode: ['BOTH'],
      clinicId: [null],
      // Clinic fields
      clinicName: [''],
      clinicAddress: [''],
      clinicPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      emergencyPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      ambulancePhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      // Pharmacist fields
      pharmacyName: [''],
      pharmacyAddress: [''],
      pharmacyPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      pharmacyEmail: ['', [Validators.email]],
      // Laboratory fields
      labName: [''],
      labAddress: [''],
      labPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      // Home Care Provider fields
      certificationDocument: [''],
      selectedServices: this.fb.array([]),
      password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.onRoleChange();
    this.loadHomeCareServices();
    this.loadClinics();
  }

  onFileChange(event: any) {
    // Stub implementation
    const file = event.target.files[0];
    if (file) {
      this.registerForm.patchValue({
        certificationDocument: file
      });
    }
  }

  onServiceChange(event: any) {
    // Stub implementation
    const selectedServices = this.registerForm.get('selectedServices') as import('@angular/forms').FormArray;
    if (event.target.checked) {
      selectedServices.push(this.fb.control(event.target.value));
    } else {
      const index = selectedServices.controls.findIndex(x => x.value === event.target.value);
      selectedServices.removeAt(index);
    }
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
      const isLabStaff = role === 'LABORATORY';
      const isHomeCare = role === 'HOME_CARE_PROVIDER';

      const genderCtrl = this.registerForm.get('gender');
      const bloodTypeCtrl = this.registerForm.get('bloodType');
      const emNameCtrl = this.registerForm.get('emergencyContactName');
      const emPhoneCtrl = this.registerForm.get('emergencyContactPhone');
      
      const specialtyCtrl = this.registerForm.get('specialty');
      const licenseCtrl = this.registerForm.get('licenseNumber');
      const feeCtrl = this.registerForm.get('consultationFee');
      const modeCtrl = this.registerForm.get('consultationMode');
      const clinicNameCtrl = this.registerForm.get('clinicName');
      const clinicAddressCtrl = this.registerForm.get('clinicAddress');
      const clinicPhoneCtrl = this.registerForm.get('clinicPhone');
      const clinicEmergencyCtrl = this.registerForm.get('emergencyPhone');
      const clinicAmbulanceCtrl = this.registerForm.get('ambulancePhone');
      const pharmacyNameCtrl = this.registerForm.get('pharmacyName');
      const pharmacyAddressCtrl = this.registerForm.get('pharmacyAddress');
      const pharmacyPhoneCtrl = this.registerForm.get('pharmacyPhone');
      const pharmacyEmailCtrl = this.registerForm.get('pharmacyEmail');
      const labNameCtrl = this.registerForm.get('labName');
      const labAddressCtrl = this.registerForm.get('labAddress');
      const labPhoneCtrl = this.registerForm.get('labPhone');
      const certDocCtrl = this.registerForm.get('certificationDocument');
      const servicesCtrl = this.registerForm.get('selectedServices');

      // Clear all existing validators first to avoid overlapping logic
      [
        genderCtrl, bloodTypeCtrl, emNameCtrl, emPhoneCtrl, specialtyCtrl, licenseCtrl, feeCtrl, modeCtrl, 
        clinicNameCtrl, clinicAddressCtrl, clinicPhoneCtrl, clinicEmergencyCtrl, clinicAmbulanceCtrl,
        pharmacyNameCtrl, pharmacyAddressCtrl, pharmacyPhoneCtrl, pharmacyEmailCtrl, labNameCtrl, labAddressCtrl,
        labPhoneCtrl, certDocCtrl, servicesCtrl
      ].forEach(ctrl => {
        ctrl?.clearValidators();
        ctrl?.updateValueAndValidity();
      });

      if (isPatient) {
        genderCtrl?.setValidators([Validators.required]);
        bloodTypeCtrl?.setValidators([Validators.required]);
        emNameCtrl?.setValidators([Validators.required]);
        emPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      } else if (isDoctor || isNutritionist) {
        specialtyCtrl?.setValidators([Validators.required]);
        licenseCtrl?.setValidators([Validators.required]);
        feeCtrl?.setValidators([Validators.required, Validators.min(0)]);
        modeCtrl?.setValidators([Validators.required]);
        
        // Require clinic selection for doctors if NOT online
        const clinicIdCtrl = this.registerForm.get('clinicId');
        if (isDoctor && modeCtrl?.value !== 'ONLINE') {
          clinicIdCtrl?.setValidators([Validators.required]);
        } else {
          clinicIdCtrl?.clearValidators();
        }
        clinicIdCtrl?.updateValueAndValidity();
      } else if (isClinic) {
        clinicNameCtrl?.setValidators([Validators.required]);
        clinicAddressCtrl?.setValidators([Validators.required]);
        clinicPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        clinicEmergencyCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        clinicAmbulanceCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      } else if (isPharmacist) {
        pharmacyNameCtrl?.setValidators([Validators.required]);
        pharmacyAddressCtrl?.setValidators([Validators.required]);
        pharmacyPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        pharmacyEmailCtrl?.setValidators([Validators.required, Validators.email]);
      } else if (isLabStaff) {
        labNameCtrl?.setValidators([Validators.required]);
        labAddressCtrl?.setValidators([Validators.required]);
        labPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      } else if (isHomeCare) {
        certDocCtrl?.setValidators([Validators.required]);
        servicesCtrl?.setValidators([Validators.required, Validators.minLength(1)]);
      }

      [
        genderCtrl, bloodTypeCtrl, emNameCtrl, emPhoneCtrl, specialtyCtrl, licenseCtrl, feeCtrl, modeCtrl, 
        clinicNameCtrl, clinicAddressCtrl, clinicPhoneCtrl, clinicEmergencyCtrl, clinicAmbulanceCtrl,
        pharmacyNameCtrl, pharmacyAddressCtrl, pharmacyPhoneCtrl, pharmacyEmailCtrl, labNameCtrl, labAddressCtrl,
        labPhoneCtrl, certDocCtrl, servicesCtrl
      ].forEach(ctrl => {
        ctrl?.updateValueAndValidity();
      });
    });
  }

  get isPatient(): boolean { return this.registerForm.get('role')?.value === 'PATIENT'; }
  get isDoctor(): boolean { return this.registerForm.get('role')?.value === 'DOCTOR'; }
  get isClinic(): boolean { return this.registerForm.get('role')?.value === 'CLINIC'; }
  get isPharmacist(): boolean { return this.registerForm.get('role')?.value === 'PHARMACIST'; }
  get isLabStaff(): boolean { return this.registerForm.get('role')?.value === 'LABORATORY'; }
  get isNutritionist(): boolean { return this.registerForm.get('role')?.value === 'NUTRITIONIST'; }
  get isHomeCareProvider(): boolean { return this.registerForm.get('role')?.value === 'HOME_CARE_PROVIDER'; }

  onSubmit() {
    if (this.registerForm.valid) {
      const { terms, chronicDiseases, drugAllergies, hereditaryDiseases, ...rest } = this.registerForm.value;
      
      const payload = { ...rest };
      
      if (this.isPatient) {
        const medicalHistories = [];
        if (chronicDiseases) medicalHistories.push({ type: 'CHRONIC_DISEASE', description: chronicDiseases });
        if (drugAllergies) medicalHistories.push({ type: 'ALLERGY', description: drugAllergies });
        if (hereditaryDiseases) medicalHistories.push({ type: 'FAMILY_HISTORY', description: hereditaryDiseases });
        
        if (medicalHistories.length > 0) {
          (payload as any).medicalHistories = medicalHistories;
        }
      }

      if (this.isHomeCareProvider && rest.selectedServices) {
        (payload as any).homeCareServices = rest.selectedServices;
        delete (payload as any).selectedServices;
      }

      this.authService.register(payload).subscribe({
        next: () => {
          console.log('Registration successful');
          this.router.navigate(['/auth/login']);
        },
        error: (err: any) => {
          console.error('Registration error:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}