import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { ClinicService, Clinic } from '../../../../services/clinic.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  errorMessage: string = '';
  profileImageBase64: string | null = null;

  roles = [
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'CLINIC', label: 'Clinic' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'LABORATORY_STAFF', label: 'Laboratory Staff' }, // ✅ corrigé
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
<<<<<<< HEAD
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
=======
    { value: 'IN_PERSON', label: 'In Person' },
    { value: 'ONLINE', label: 'Video Call' },
    { value: 'BOTH', label: 'Both' }
  ];

  homeCareServicesList: any[] = [];

>>>>>>> origin/frontVersion1
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private clinicService: ClinicService,
    private router: Router
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
<<<<<<< HEAD
      chronicDiseases: [''],
      drugAllergies: [''],
      hereditaryDiseases: [''],
=======
      height: [null],
      weight: [null],
      allergies: [''],
      diseases: [''],
>>>>>>> origin/frontVersion1
      specialty: [''],
      licenseNumber: [''],
      consultationFee: [0],
      consultationMode: ['BOTH'],
<<<<<<< HEAD
      clinicId: [null],
=======
>>>>>>> origin/frontVersion1
      // Clinic fields
      clinicName: [''],
      clinicAddress: [''],
      clinicPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
<<<<<<< HEAD
      emergencyPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      ambulancePhone: ['', [Validators.pattern('^[0-9]{8}$')]],
=======
      emergencyPhone: ['', [Validators.pattern('^[0-9]{3}$')]],
      ambulancePhone: ['', [Validators.pattern('^[0-9]{3}$')]],
>>>>>>> origin/frontVersion1
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
      terms: [false, Validators.requiredTrue],
      profileImage: [null]
    });
  }

  ngOnInit() {
    this.onRoleChange();
    this.loadHomeCareServices();
<<<<<<< HEAD
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
=======
>>>>>>> origin/frontVersion1
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
<<<<<<< HEAD
      
=======
      const heightCtrl = this.registerForm.get('height');
      const weightCtrl = this.registerForm.get('weight');
      const allergiesCtrl = this.registerForm.get('allergies');
      const diseasesCtrl = this.registerForm.get('diseases');

      const isDoctor = role === 'DOCTOR';
      const isNutritionist = role === 'NUTRITIONIST';
>>>>>>> origin/frontVersion1
      const specialtyCtrl = this.registerForm.get('specialty');
      const licenseCtrl = this.registerForm.get('licenseNumber');
      const feeCtrl = this.registerForm.get('consultationFee');
      const modeCtrl = this.registerForm.get('consultationMode');
<<<<<<< HEAD
=======

      const isClinic = role === 'CLINIC';
>>>>>>> origin/frontVersion1
      const clinicNameCtrl = this.registerForm.get('clinicName');
      const clinicAddressCtrl = this.registerForm.get('clinicAddress');
      const clinicPhoneCtrl = this.registerForm.get('clinicPhone');
      const clinicEmergencyCtrl = this.registerForm.get('emergencyPhone');
      const clinicAmbulanceCtrl = this.registerForm.get('ambulancePhone');
<<<<<<< HEAD
=======

      const isPharmacist = role === 'PHARMACIST';
>>>>>>> origin/frontVersion1
      const pharmacyNameCtrl = this.registerForm.get('pharmacyName');
      const pharmacyAddressCtrl = this.registerForm.get('pharmacyAddress');
      const pharmacyPhoneCtrl = this.registerForm.get('pharmacyPhone');
      const pharmacyEmailCtrl = this.registerForm.get('pharmacyEmail');
<<<<<<< HEAD
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
=======

      const isLabStaff = role === 'LABORATORY_STAFF';
      const labNameCtrl = this.registerForm.get('labName');
      const labAddressCtrl = this.registerForm.get('labAddress');
      const labPhoneCtrl = this.registerForm.get('labPhone');

      const isHomeCare = role === 'HOME_CARE_PROVIDER';
      const certDocCtrl = this.registerForm.get('certificationDocument');
      const servicesCtrl = this.registerForm.get('selectedServices');

      // Reset validators
      [genderCtrl, bloodTypeCtrl, emNameCtrl, emPhoneCtrl, heightCtrl, weightCtrl, allergiesCtrl, diseasesCtrl,
        specialtyCtrl, licenseCtrl, feeCtrl, modeCtrl,
        clinicNameCtrl, clinicAddressCtrl, clinicPhoneCtrl, clinicEmergencyCtrl, clinicAmbulanceCtrl,
        pharmacyNameCtrl, pharmacyAddressCtrl, pharmacyPhoneCtrl, pharmacyEmailCtrl,
        labNameCtrl, labAddressCtrl, labPhoneCtrl, certDocCtrl, servicesCtrl
>>>>>>> origin/frontVersion1
      ].forEach(ctrl => {
        ctrl?.clearValidators();
        ctrl?.updateValueAndValidity();
      });

      if (isPatient) {
        genderCtrl?.setValidators([Validators.required]);
        bloodTypeCtrl?.setValidators([Validators.required]);
<<<<<<< HEAD
        emNameCtrl?.setValidators([Validators.required]);
        emPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
=======
        heightCtrl?.setValidators([Validators.required, Validators.min(0)]);
        weightCtrl?.setValidators([Validators.required, Validators.min(0)]);
>>>>>>> origin/frontVersion1
      } else if (isDoctor || isNutritionist) {
        specialtyCtrl?.setValidators([Validators.required]);
        licenseCtrl?.setValidators([Validators.required]);
        feeCtrl?.setValidators([Validators.required, Validators.min(0)]);
        modeCtrl?.setValidators([Validators.required]);
<<<<<<< HEAD
        
        // Require clinic selection for doctors if NOT online
        const clinicIdCtrl = this.registerForm.get('clinicId');
        if (isDoctor && modeCtrl?.value !== 'ONLINE') {
          clinicIdCtrl?.setValidators([Validators.required]);
        } else {
          clinicIdCtrl?.clearValidators();
        }
        clinicIdCtrl?.updateValueAndValidity();
=======
>>>>>>> origin/frontVersion1
      } else if (isClinic) {
        clinicNameCtrl?.setValidators([Validators.required]);
        clinicAddressCtrl?.setValidators([Validators.required]);
        clinicPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
<<<<<<< HEAD
        clinicEmergencyCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        clinicAmbulanceCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
=======
        clinicEmergencyCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{3}$')]);
        clinicAmbulanceCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{3}$')]);
>>>>>>> origin/frontVersion1
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

<<<<<<< HEAD
      [
        genderCtrl, bloodTypeCtrl, emNameCtrl, emPhoneCtrl, specialtyCtrl, licenseCtrl, feeCtrl, modeCtrl, 
        clinicNameCtrl, clinicAddressCtrl, clinicPhoneCtrl, clinicEmergencyCtrl, clinicAmbulanceCtrl,
        pharmacyNameCtrl, pharmacyAddressCtrl, pharmacyPhoneCtrl, pharmacyEmailCtrl, labNameCtrl, labAddressCtrl,
        labPhoneCtrl, certDocCtrl, servicesCtrl
      ].forEach(ctrl => {
        ctrl?.updateValueAndValidity();
      });
=======
      [genderCtrl, bloodTypeCtrl, emNameCtrl, emPhoneCtrl, heightCtrl, weightCtrl, allergiesCtrl, diseasesCtrl, 
        specialtyCtrl, licenseCtrl, feeCtrl, modeCtrl,
        clinicNameCtrl, clinicAddressCtrl, clinicPhoneCtrl, clinicEmergencyCtrl, clinicAmbulanceCtrl,
        pharmacyNameCtrl, pharmacyAddressCtrl, pharmacyPhoneCtrl, pharmacyEmailCtrl,
        labNameCtrl, labAddressCtrl, labPhoneCtrl, certDocCtrl, servicesCtrl
      ].forEach(ctrl => ctrl?.updateValueAndValidity());
>>>>>>> origin/frontVersion1
    });
  }

  get isPatient(): boolean { return this.registerForm.get('role')?.value === 'PATIENT'; }
  get isDoctor(): boolean { return this.registerForm.get('role')?.value === 'DOCTOR'; }
  get isClinic(): boolean { return this.registerForm.get('role')?.value === 'CLINIC'; }
  get isPharmacist(): boolean { return this.registerForm.get('role')?.value === 'PHARMACIST'; }
<<<<<<< HEAD
  get isLabStaff(): boolean { return this.registerForm.get('role')?.value === 'LABORATORY'; }
  get isNutritionist(): boolean { return this.registerForm.get('role')?.value === 'NUTRITIONIST'; }
  get isHomeCareProvider(): boolean { return this.registerForm.get('role')?.value === 'HOME_CARE_PROVIDER'; }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        this.errorMessage = 'La taille de l\'image ne doit pas dépasser 2Mo.';
        return;
      }
      this.errorMessage = '';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageBase64 = e.target.result;
        this.registerForm.patchValue({ profileImage: this.profileImageBase64 });
=======
  get isLabStaff(): boolean {return this.registerForm.get('role')?.value === 'LABORATORY_STAFF'; }
  get isHomeCareProvider(): boolean { return this.registerForm.get('role')?.value === 'HOME_CARE_PROVIDER'; }
  get isNutritionist(): boolean { return this.registerForm.get('role')?.value === 'NUTRITIONIST'; }

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
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.registerForm.patchValue({
          certificationDocument: reader.result as string
        });
>>>>>>> origin/frontVersion1
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
<<<<<<< HEAD
      const { terms, chronicDiseases, drugAllergies, hereditaryDiseases, ...rest } = this.registerForm.value;
      const payload: any = { ...rest };
      
      if (this.isPatient) {
        const medicalHistories = [];
        if (chronicDiseases?.trim()) medicalHistories.push({ type: 'CHRONIC_DISEASE', description: chronicDiseases.trim() });
        if (drugAllergies?.trim()) medicalHistories.push({ type: 'ALLERGY', description: drugAllergies.trim() });
        if (hereditaryDiseases?.trim()) medicalHistories.push({ type: 'FAMILY_HISTORY', description: hereditaryDiseases.trim() });
        
        if (medicalHistories.length > 0) {
          payload.medicalHistories = medicalHistories;
        }
      }

      if (this.isHomeCareProvider && rest.selectedServices) {
        payload.homeCareServices = rest.selectedServices;
        delete payload.selectedServices;
      }

      if (this.profileImageBase64) {
          payload.profileImage = this.profileImageBase64;
      }

      this.authService.register(payload).subscribe({
        next: () => {
          console.log('Registration successful');
=======
      const formValue = this.registerForm.value;
      const role = formValue.role;

      let finalPayload: any = {
        fullName: formValue.fullName,
        email: formValue.email,
        password: formValue.password,
        role: role,
        phone: formValue.phone,
        birthDate: formValue.birthDate,
      };

      console.log('📝 Initial Payload:', finalPayload);

      if (role === 'PATIENT') {
        finalPayload = { ...finalPayload,
          gender: formValue.gender,
          bloodType: formValue.bloodType,
          emergencyContactName: formValue.emergencyContactName,
          emergencyContactPhone: formValue.emergencyContactPhone,
          height: formValue.height,
          weight: formValue.weight,
          allergies: formValue.allergies,
          diseases: formValue.diseases
        };
      } else if (role === 'DOCTOR' || role === 'NUTRITIONIST') {
        finalPayload = { ...finalPayload,
          specialty: formValue.specialty,
          licenseNumber: formValue.licenseNumber,
          consultationFee: formValue.consultationFee,
          consultationMode: formValue.consultationMode,
        };
      } else if (role === 'CLINIC') {
        finalPayload = { ...finalPayload,
          clinicName: formValue.clinicName,
          clinicAddress: formValue.clinicAddress,
          clinicPhone: formValue.clinicPhone,
          emergencyPhone: formValue.emergencyPhone,
          ambulancePhone: formValue.ambulancePhone,
        };
      } else if (role === 'PHARMACIST') {
        finalPayload = { ...finalPayload,
          pharmacyName: formValue.pharmacyName,
          pharmacyAddress: formValue.pharmacyAddress,
          pharmacyPhone: formValue.pharmacyPhone,
          pharmacyEmail: formValue.pharmacyEmail,
        };
      } else if (role === 'LABORATORY_STAFF') {
        finalPayload = { ...finalPayload,
          labName: formValue.labName,
          labAddress: formValue.labAddress,
          labPhone: formValue.labPhone,
        };
      } else if (role === 'HOME_CARE_PROVIDER') {
        finalPayload = { ...finalPayload,
          certificationDocument: formValue.certificationDocument,
          homeCareServices: formValue.selectedServices
        };
      }

      console.log('🚀 Final Registration Payload:', finalPayload);

      this.authService.register(finalPayload).subscribe({
        next: (res) => {
          console.log('✅ Registration SUCCESS:', res);
>>>>>>> origin/frontVersion1
          this.router.navigate(['/auth/login']);
        },
        error: (err: any) => {
          console.error('❌ Registration ERROR:', err);
          console.log('❌ Error Body:', err.error);
          this.errorMessage = err.error?.message || err.error || err.message || 'Erreur lors de l\'inscription';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}