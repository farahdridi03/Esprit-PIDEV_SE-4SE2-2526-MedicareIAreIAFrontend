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
        next: (response) => {
          const role = response.role || this.authService.getUserRole();
          this.redirectBasedOnRole(role);
        },
        error: (err) => {
          console.error('Login error full response:', err);
          if (err.status === 400) {
            this.errorMessage = err.error?.message || 'Mauvaise requête. Vérifiez le format (Email/password).';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage = err.error?.message || 'Identifiants invalides ou compte non activé.';
          } else {
            this.errorMessage = err.error?.message || err.error || 'Erreur lors de la connexion. Vérifiez le serveur.';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all fields correctly.';
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
      'PHARMACIST': '/front/pharmacist/dashboard',
      'CLINIC': '/front/clinic/dashboard',
      'HOME_CARE_PROVIDER': '/front/home-care',
      'VISITOR': '/front',
    };

    let targetRoute = routes[cleanRole] ?? '/front';

    console.log('Target route identified:', targetRoute);
    this.router.navigate([targetRoute]).then(success => {
      if (success) {
        console.log('Navigation successful to:', targetRoute);
      } else {
        console.error('Navigation FAILED to:', targetRoute);
      }
    }).catch(err => {
      console.error('Navigation ERROR to:', targetRoute, err);
    });
  }
}
