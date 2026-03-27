import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AuthResponse } from '../../../../models/auth-response.model';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.scss']
})
export class VerifyCodeComponent implements OnInit {
  verifyForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    // Try to get email from query params first (if sent from backend or previous page)
    this.route.queryParams.subscribe(params => {
        let foundEmail = params['email'];
        if (foundEmail) {
            localStorage.setItem('verification_email', String(foundEmail));
        } else {
            foundEmail = localStorage.getItem('verification_email');
        }

        if (foundEmail) {
          this.verifyForm.patchValue({ email: foundEmail });
        }
    });
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const code = this.verifyForm.value.code?.toString().trim();
    const formEmail = this.verifyForm.value.email?.toString().trim();

    this.authService.verifyGoogleAuth(formEmail, code).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        // Clean up stored email
        localStorage.removeItem('verification_email');

        // Redirect based on role
        const role = response.role || this.authService.getUserRole();
        this.redirectBasedOnRole(role);
      },
      error: (err: any) => {
        this.isLoading = false;
        
        const rawErrorMsg = err?.error?.error || err?.error || '';
        
        if (typeof rawErrorMsg === 'string' && rawErrorMsg.includes('granted authority textual representation')) {
           this.errorMessage = "Votre compte Google n'a pas de rôle assigné dans la base de données (ex: ROLE_PATIENT). Veuillez contacter l'administrateur.";
        } else if (err?.status === 401 || err?.status === 403) {
           this.errorMessage = "Code invalide ou expiré. Veuillez réessayer.";
        } else if (err?.status === 0 || err?.status >= 500) {
           this.errorMessage = "Le serveur est indisponible. Veuillez réessayer plus tard.";
        } else {
           this.errorMessage = err?.error?.message || "La vérification a échoué. Veuillez vérifier votre code.";
        }
      }
    });
  }

  resendCode(): void {
    const formEmail = this.verifyForm.value.email;
    if (!formEmail) {
      this.errorMessage = 'Please enter your email to resend the code.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    
    // Setup for calling resend endpoint
    // this.authService.resendGoogleAuthCode(formEmail).subscribe(...)
    
    // Simulation for now
    setTimeout(() => {
      this.isLoading = false;
      alert(`A new verification code has been sent to ${formEmail} (Simulation)`);
    }, 1000);
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
