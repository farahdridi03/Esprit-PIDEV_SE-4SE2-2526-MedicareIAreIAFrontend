import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-password-modal',
  templateUrl: './password-modal.component.html',
  styleUrls: ['./password-modal.component.scss']
})
export class PasswordModalComponent {
  @Output() close = new EventEmitter<void>();
  passwordForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private userService: UserService, private authService: AuthService) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const request = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    const userId = this.authService.getUserId();
    if (!userId) {
      this.loading = false;
      this.errorMessage = "User session not found.";
      return;
    }

    this.userService.changePassword(userId, request).subscribe({
      next: () => {
        this.loading = false;
        alert('Password updated successfully');
        this.close.emit();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || (typeof err.error === 'string' ? err.error : 'Failed to update password. Please check your current password.');
      }
    });
  }

  onCancel() {
    this.close.emit();
  }
}
