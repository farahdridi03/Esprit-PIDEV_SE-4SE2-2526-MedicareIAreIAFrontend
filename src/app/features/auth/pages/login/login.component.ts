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
    console.log('LoginComponent initialized'); // Debug log
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    console.log('onSubmit called');
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const payload = { email: email.trim(), password };
      
      console.log('Form is valid, calling login...', payload);
      this.authService.login(payload).subscribe({
        next: (response) => {
          console.log('Login successful response:', response);
          const role = response.role || this.authService.getUserRole();
          console.log('Determined role:', role);
          this.redirectBasedOnRole(role);
        },
        error: (err) => {
          console.error('Login error:', err);
          // Make error output clear for developers/users
          if (err.status === 400) {
            this.errorMessage = err.error?.message || 'Mauvaise requête. Vérifiez le format (Email/password).';
          } else if (err.status === 401 || err.status === 403) {
            this.errorMessage = err.error?.message || 'Identifiants invalides ou compte non activé.';
          } else {
            this.errorMessage = err.error?.message || 'Erreur lors de la connexion. Vérifiez le serveur.';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please fill out all fields correctly.';
      console.warn('Form is invalid:', this.loginForm.errors);
      Object.keys(this.loginForm.controls).forEach(key => {
        const controlErrors = this.loginForm.get(key)?.errors;
        if (controlErrors != null) {
          console.warn(`Control ${key} errors:`, controlErrors);
        }
      });
    }
  }

  private redirectBasedOnRole(role: string | null) {
    if (!role) {
      console.warn('No role provided for redirection');
      this.router.navigate(['/front']);
      return;
    }

    const cleanRole = role.replace(/^ROLE_/, '').toUpperCase();
    console.log('Redirecting for role:', cleanRole);

    let targetRoute = '/front';

    switch (cleanRole) {
      case 'ADMIN':
        targetRoute = '/admin/dashboard';
        break;
      case 'DOCTOR':
        targetRoute = '/front/doctor/dashboard';
        break;
      case 'PATIENT':
        targetRoute = '/front/patient/dashboard';
        break;
      case 'NUTRITIONIST':
        targetRoute = '/front/nutritionist/dashboard';
        break;
      case 'LABORATORY':
        targetRoute = '/front/laboratory';
        break;
      case 'PHARMACIST':
        targetRoute = '/front/pharmacist/dashboard';
        break;
      case 'CLINIC':
        targetRoute = '/front/clinic/dashboard';
        break;
      case 'VISITOR':
        targetRoute = '/front';
        break;
      case 'HOME_CARE_PROVIDER':
      case 'HOME_CARE':
        targetRoute = '/front/home-care';
        break;
      default:
        console.warn('Unknown role, defaulting to /front:', cleanRole);
        targetRoute = '/front';
        break;
    }

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

