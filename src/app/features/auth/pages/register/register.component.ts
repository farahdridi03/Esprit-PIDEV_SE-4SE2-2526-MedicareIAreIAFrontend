import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  errorMessage: string = '';

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
    { value: 'IN_PERSON', label: 'In Person' },
    { value: 'ONLINE', label: 'Video Call' },
    { value: 'BOTH', label: 'Both' }
  ];

  homeCareServicesList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
      height: [null],
      weight: [null],
      allergies: [''],
      diseases: [''],
      specialty: [''],
      licenseNumber: [''],
      consultationFee: [0],
      consultationMode: ['BOTH'],
      // Clinic fields
      clinicName: [''],
      clinicAddress: [''],
      clinicPhone: ['', [Validators.pattern('^[0-9]{8}$')]],
      emergencyPhone: ['', [Validators.pattern('^[0-9]{3}$')]],
      ambulancePhone: ['', [Validators.pattern('^[0-9]{3}$')]],
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
      const genderCtrl = this.registerForm.get('gender');
      const bloodTypeCtrl = this.registerForm.get('bloodType');
      const emNameCtrl = this.registerForm.get('emergencyContactName');
      const emPhoneCtrl = this.registerForm.get('emergencyContactPhone');
      const heightCtrl = this.registerForm.get('height');
      const weightCtrl = this.registerForm.get('weight');
      const allergiesCtrl = this.registerForm.get('allergies');
      const diseasesCtrl = this.registerForm.get('diseases');

      const isDoctor = role === 'DOCTOR';
      const isNutritionist = role === 'NUTRITIONIST';
      const specialtyCtrl = this.registerForm.get('specialty');
      const licenseCtrl = this.registerForm.get('licenseNumber');
      const feeCtrl = this.registerForm.get('consultationFee');
      const modeCtrl = this.registerForm.get('consultationMode');

      const isClinic = role === 'CLINIC';
      const clinicNameCtrl = this.registerForm.get('clinicName');
      const clinicAddressCtrl = this.registerForm.get('clinicAddress');
      const clinicPhoneCtrl = this.registerForm.get('clinicPhone');
      const clinicEmergencyCtrl = this.registerForm.get('emergencyPhone');
      const clinicAmbulanceCtrl = this.registerForm.get('ambulancePhone');

      const isPharmacist = role === 'PHARMACIST';
      const pharmacyNameCtrl = this.registerForm.get('pharmacyName');
      const pharmacyAddressCtrl = this.registerForm.get('pharmacyAddress');
      const pharmacyPhoneCtrl = this.registerForm.get('pharmacyPhone');
      const pharmacyEmailCtrl = this.registerForm.get('pharmacyEmail');

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
      ].forEach(ctrl => {
        ctrl?.clearValidators();
        ctrl?.updateValueAndValidity();
      });

      if (isPatient) {
        genderCtrl?.setValidators([Validators.required]);
        bloodTypeCtrl?.setValidators([Validators.required]);
        heightCtrl?.setValidators([Validators.required, Validators.min(0)]);
        weightCtrl?.setValidators([Validators.required, Validators.min(0)]);
      } else if (isDoctor || isNutritionist) {
        specialtyCtrl?.setValidators([Validators.required]);
        licenseCtrl?.setValidators([Validators.required]);
        feeCtrl?.setValidators([Validators.required, Validators.min(0)]);
        modeCtrl?.setValidators([Validators.required]);
      } else if (isClinic) {
        clinicNameCtrl?.setValidators([Validators.required]);
        clinicAddressCtrl?.setValidators([Validators.required]);
        clinicPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
        clinicEmergencyCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{3}$')]);
        clinicAmbulanceCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{3}$')]);
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

      [genderCtrl, bloodTypeCtrl, emNameCtrl, emPhoneCtrl, heightCtrl, weightCtrl, allergiesCtrl, diseasesCtrl, 
        specialtyCtrl, licenseCtrl, feeCtrl, modeCtrl,
        clinicNameCtrl, clinicAddressCtrl, clinicPhoneCtrl, clinicEmergencyCtrl, clinicAmbulanceCtrl,
        pharmacyNameCtrl, pharmacyAddressCtrl, pharmacyPhoneCtrl, pharmacyEmailCtrl,
        labNameCtrl, labAddressCtrl, labPhoneCtrl, certDocCtrl, servicesCtrl
      ].forEach(ctrl => ctrl?.updateValueAndValidity());
    });
  }

  get isPatient(): boolean { return this.registerForm.get('role')?.value === 'PATIENT'; }
  get isDoctor(): boolean { return this.registerForm.get('role')?.value === 'DOCTOR'; }
  get isClinic(): boolean { return this.registerForm.get('role')?.value === 'CLINIC'; }
  get isPharmacist(): boolean { return this.registerForm.get('role')?.value === 'PHARMACIST'; }
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
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
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

      console.log('✅ PAYLOAD:', finalPayload);

      this.authService.register(finalPayload).subscribe({
        next: (res) => {
          console.log('✅ SUCCESS:', res);
          this.router.navigate(['/auth/login']);
        },
        error: (err: any) => {
          console.error('❌ ERROR:', err);
          this.errorMessage = err.error?.message || err.error || err.message || 'Erreur lors de l\'inscription';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}