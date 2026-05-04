import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const role = response.role || this.authService.getUserRole();
          this.redirectBasedOnRole(role);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Invalid credentials';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all fields correctly.';
    }
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:8081/springsecurity/oauth2/authorization/google';
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
      'PHARMACIST': '/pharmacist/stock/dashboard',
      'CLINIC': '/front/clinic',
      'HOME_CARE_PROVIDER': '/front/home-care',
      'VISITOR': '/front',
    };

    const target = routes[cleanRole] ?? '/front';
    this.router.navigate([target]);
  }
}