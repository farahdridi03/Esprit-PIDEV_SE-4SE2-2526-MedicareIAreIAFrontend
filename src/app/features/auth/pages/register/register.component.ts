import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';
  profileImageBase64: string | null = null;

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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
      password: ['', [Validators.required, Validators.minLength(8)]],
      terms: [false, Validators.requiredTrue],
      profileImage: [null]
    });

    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const isPatient = role === 'PATIENT';
      const genderCtrl = this.registerForm.get('gender');
      const bloodTypeCtrl = this.registerForm.get('bloodType');
      const emNameCtrl = this.registerForm.get('emergencyContactName');
      const emPhoneCtrl = this.registerForm.get('emergencyContactPhone');

      // Pour l'instant on laisse les maladies comme optionnelles même pour les patients.
      if (isPatient) {
        genderCtrl?.setValidators([Validators.required]);
        bloodTypeCtrl?.setValidators([Validators.required]);
        emNameCtrl?.setValidators([Validators.required]);
        emPhoneCtrl?.setValidators([Validators.required, Validators.pattern('^[0-9]{8}$')]);
      } else {
        genderCtrl?.clearValidators();
        bloodTypeCtrl?.clearValidators();
        emNameCtrl?.clearValidators();
        emPhoneCtrl?.clearValidators();
      }

      genderCtrl?.updateValueAndValidity();
      bloodTypeCtrl?.updateValueAndValidity();
      emNameCtrl?.updateValueAndValidity();
      emPhoneCtrl?.updateValueAndValidity();
    });
  }

  get isPatient(): boolean {
    return this.registerForm.get('role')?.value === 'PATIENT';
  }

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
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const payload: any = { ...this.registerForm.value };
      delete payload.terms;
      
      if (this.profileImageBase64) {
          payload.profileImage = this.profileImageBase64;
      }

      // ✅ Map individual fields to the medicalHistories array for the backend DTO
      const histories = [];
      if (payload.chronicDiseases?.trim()) {
        histories.push({ type: 'CHRONIC_DISEASE', description: payload.chronicDiseases.trim() });
      }
      if (payload.drugAllergies?.trim()) {
        histories.push({ type: 'ALLERGY', description: payload.drugAllergies.trim() });
      }
      if (payload.hereditaryDiseases?.trim()) {
        histories.push({ type: 'FAMILY_HISTORY', description: payload.hereditaryDiseases.trim() });
      }

      if (histories.length > 0) {
        payload.medicalHistories = histories;
      }

      // Supprimer les clés qui n'existent pas dans RegisterRequest
      delete payload.chronicDiseases;
      delete payload.drugAllergies;
      delete payload.hereditaryDiseases;

      // ✅ Un seul endpoint pour tous les rôles → /api/auth/register
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