import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
  styleUrls: ['./google-callback.component.scss']
})
export class GoogleCallbackComponent implements OnInit {
  errorMessage: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Read the email query parameter from the callback URL
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      
      if (email) {
        // Store email temporarily
        localStorage.setItem('verification_email', email);
        
        // Redirect to OTP verification page
        this.router.navigate(['/auth/verify-code'], { queryParams: { email: email } });
      } else {
        // If email is missing, something went wrong with the callback
        this.errorMessage = "Email missing from Google response. Please try again.";
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
