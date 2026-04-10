import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { DoctorService } from '../../../../services/doctor.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  initials: string = 'U';
  displayName: string = 'Welcome Back';
  displayRole: string = 'Sign in to your account';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private doctorService: DoctorService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Update initials dynamically as user types email
    this.loginForm.get('email')?.valueChanges.subscribe((email: string) => {
      this.updateInitialsFromEmail(email);
    });
  }

  private updateInitialsFromEmail(email: string): void {
    if (!email) { this.initials = 'U'; return; }
    const local = email.split('@')[0];
    const parts = local.split(/[._-]/);
    if (parts.length >= 2) {
      this.initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      this.initials = local.substring(0, 2).toUpperCase();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const role = response.role || this.authService.getUserRole();
        this.redirectBasedOnRole(role);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error || 'Invalid credentials. Please try again.';
      }
    });
  }

  private redirectBasedOnRole(role: string | null): void {
    if (!role) { this.router.navigate(['/front']); return; }

    const cleanRole = role.replace(/^ROLE_/, '').toUpperCase();
    const routes: { [key: string]: string } = {
      'ADMIN': '/admin/dashboard',
      'DOCTOR': '/front/doctor/dashboard',
      'PATIENT': '/front/patient/dashboard',
      'NUTRITIONIST': '/front/nutritionist/dashboard',
      'LABORATORY_STAFF': '/front/laboratorystaff/dashboard',
      'PHARMACIST': '/front/pharmacist',
      'CLINIC': '/front/clinic',
      'HOME_CARE_PROVIDER': '/front/home-care',
      'VISITOR': '/front',
    };

    this.router.navigate([routes[cleanRole] ?? '/front']);
  }
}
