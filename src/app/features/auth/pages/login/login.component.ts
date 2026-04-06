import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { DoctorService } from '../../../../services/doctor.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private doctorService: DoctorService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { rememberMe, ...loginData } = this.loginForm.value;
      console.log('Form is valid, calling login with data:', loginData);
      
      this.authService.login(loginData).subscribe({
        next: (response: any) => {
          const role = response.role || this.authService.getUserRole();
          this.redirectBasedOnRole(role);
        },
        error: (err: any) => {
          console.error('Login error full response:', err);
          this.errorMessage = err.error?.message || err.error || 'Identifiants invalides';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
    }
  }

  private redirectBasedOnRole(role: string | null) {
    if (!role) {
      this.router.navigate(['/front']);
      return;
    }

    const cleanRole = role.replace(/^ROLE_/, '').toUpperCase();

    const routes: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'DOCTOR': '/front/doctor/dashboard',
      'PATIENT': '/front/patient/dashboard',
      'NUTRITIONIST': '/front/nutritionist/dashboard',
      'LABORATORY_STAFF': '/front/laboratorystaff/dashboard',
      'LABORATORYSTAFF': '/front/laboratorystaff/dashboard',
      'PHARMACIST': '/front/pharmacist',
      'CLINIC': '/front/clinic',
      'HOME_CARE_PROVIDER': '/front/home-care',
      'VISITOR': '/front',
    };

    const target = routes[cleanRole] ?? '/front';
    this.router.navigate([target]);
  }
}