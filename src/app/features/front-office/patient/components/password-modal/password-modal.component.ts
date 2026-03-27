import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../../services/user.service';

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

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const request = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.userService.changePassword(request).subscribe({
      next: () => {
        this.loading = false;
        alert('Password updated successfully');
        this.close.emit();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = typeof err.error === 'string' ? err.error : 'Failed to update password. Please check your current password.';
      }
    });
  }

  onCancel() {
    this.close.emit();
  }
}
