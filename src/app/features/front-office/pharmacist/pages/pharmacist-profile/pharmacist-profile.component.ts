import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'app-pharmacist-profile',
    templateUrl: './pharmacist-profile.component.html',
    styleUrl: './pharmacist-profile.component.scss'
})
export class PharmacistProfileComponent implements OnInit, OnDestroy {
    profileForm!: FormGroup;
    passwordForm!: FormGroup;
    passwordConfirmationForm!: FormGroup; // For confirming password before profile update

    isLoading = false;
    isSaving = false;
    isPasswordChanging = false;
    showPasswordForm = false;
    showPasswordConfirmation = false; // Show password confirmation dialog

    errorMessage = '';
    successMessage = '';

    private successTimeout: any;
    private currentUserData: any; // Store complete user data from backend

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    /**
     * Initialize reactive forms
     */
    private initializeForms(): void {
        // Profile Form - with backend required fields
        // All fields are optional to allow users to modify only one field at a time
        // Values not modified by user will be filled from currentUserData on submit
        this.profileForm = this.fb.group({
            firstName: ['', [this.minLengthIfPresent(2)]],
            lastName: ['', [this.minLengthIfPresent(2)]],
            email: ['', [Validators.email]], // Optional - only validate format if provided
            phone: ['', [this.minLengthIfPresent(8)]], // Optional - validate only if has content
            password: ['', { value: '', disabled: true }], // Password field - disabled/readonly
            birthDate: [''], // Optional - no validation

            // Pharmacy Info (optional)
            pharmacyName: ['', [this.minLengthIfPresent(3)]],
            pharmacyPhone: ['', [this.minLengthIfPresent(8)]], // Pharmacy phone number
            registrationNumber: ['', { value: '', disabled: true }],
            address: ['', [this.minLengthIfPresent(5)]],
            city: ['', [this.minLengthIfPresent(2)]]
        });

        // Password confirmation form (for profile updates - backend requires current password)
        this.passwordConfirmationForm = this.fb.group({
            currentPassword: ['', Validators.required]
        });

        // Password Form
        this.passwordForm = this.fb.group(
            {
                currentPassword: ['', Validators.required],
                newPassword: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', Validators.required]
            },
            { validators: this.passwordMatchValidator }
        );
    }

    /**
     * Load user profile from backend
     */
    loadProfile(): void {
        this.isLoading = true;
        this.errorMessage = '';

        const userId = this.authService.getUserId();
        if (!userId || userId === null) {
            this.errorMessage = 'User ID not found. Please login again.';
            this.isLoading = false;
            return;
        }

        this.userService.getById(userId).subscribe({
            next: (user) => {
                this.populateProfileForm(user);
                this.isLoading = false;
            },
            error: (err) => {
                this.errorMessage = 'Failed to load profile. Please try again.';
                this.isLoading = false;
                console.error('Error loading profile:', err);
            }
        });
    }

    /**
     * Populate form with user data
     */
    private populateProfileForm(user: any): void {
        // Store complete user data for later use
        this.currentUserData = user;

        this.profileForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '••••••••', // Display masked password (backend doesn't return it for security)
            birthDate: user.birthDate || '',

            pharmacyName: user.pharmacyName || '',
            pharmacyPhone: user.pharmacyPhone || '', // Load pharmacy phone from server
            registrationNumber: user.registrationNumber || '',
            address: user.address || '',
            city: user.city || ''
        });
    }

    /**
     * Submit profile form
     */
    onSubmit(): void {
        // Don't validate form here - just show password confirmation modal
        // The real validation happens in submitProfileWithPassword()
        // This allows users to leave empty fields (which will use server values)
        this.errorMessage = ''; // Clear any previous errors
        this.showPasswordConfirmation = true;
    }

    /**
     * Submit profile with confirmed password
     */
    submitProfileWithPassword(): void {
        if (!this.passwordConfirmationForm.valid) {
            this.errorMessage = 'Please enter your current password.';
            return;
        }

        this.isSaving = true;
        this.errorMessage = '';

        const userId = this.authService.getUserId();
        if (!userId || userId === null) {
            this.errorMessage = 'User ID not found. Please login again.';
            this.isSaving = false;
            return;
        }

        // Get all form values
        const rawData = this.profileForm.getRawValue();
        const currentPassword = this.passwordConfirmationForm.get('currentPassword')?.value;

        // Helper function to get value: use form input if provided, otherwise use server value
        const getValue = (formValue: any, fieldName: string, defaultValue: string = ''): string => {
            const trimmedFormValue = formValue?.toString().trim() || '';
            return trimmedFormValue || this.currentUserData?.[fieldName] || defaultValue;
        };

        // Build profile data exactly as UserRequestDTO expects
        // All fields use form input if provided, otherwise fall back to server values
        const builtFullName = this.buildFullName(rawData);
        const profileData: any = {
            // Required fields from UserRequestDTO
            fullName: builtFullName || this.currentUserData?.fullName || '',
            email: getValue(rawData.email, 'email', ''),
            phone: getValue(rawData.phone, 'phone', ''),
            birthDate: rawData.birthDate || this.currentUserData?.birthDate || '',
            password: currentPassword, // Use the password entered by user
            role: this.currentUserData?.role || 'USER',

            // Optional pharmacy fields
            pharmacyName: getValue(rawData.pharmacyName, 'pharmacyName', ''),
            pharmacyPhone: getValue(rawData.pharmacyPhone, 'pharmacyPhone', ''),
            address: getValue(rawData.address, 'address', ''),
            city: getValue(rawData.city, 'city', ''),
            registrationNumber: this.currentUserData?.registrationNumber || ''
        };

        // Validate that all REQUIRED fields have values
        const missingFields = [];
        if (!profileData.fullName?.trim()) missingFields.push('Full Name (First + Last)');
        if (!profileData.email?.trim()) missingFields.push('Email');
        if (!profileData.phone?.trim()) missingFields.push('Phone');
        if (!profileData.birthDate) missingFields.push('Birth Date');
        if (!profileData.password?.trim()) missingFields.push('Password');

        if (missingFields.length > 0) {
            this.errorMessage = `Missing required fields: ${missingFields.join(', ')}. Please reload your profile and try again.`;
            this.isSaving = false;
            return;
        }

        console.log('=== PHARMACIST PROFILE UPDATE ===');
        console.log('User can modify SINGLE field - other fields use server values:');
        console.log('Fields modified by user:', {
            firstName: rawData.firstName?.trim() ? '✓ Modified' : '✗ Using server value',
            lastName: rawData.lastName?.trim() ? '✓ Modified' : '✗ Using server value',
            email: rawData.email?.trim() ? '✓ Modified' : '✗ Using server value',
            phone: rawData.phone?.trim() ? '✓ Modified' : '✗ Using server value',
            birthDate: rawData.birthDate ? '✓ Modified' : '✗ Using server value',
            pharmacyName: rawData.pharmacyName?.trim() ? '✓ Modified' : '✗ Using server value',
            pharmacyPhone: rawData.pharmacyPhone?.trim() ? '✓ Modified' : '✗ Using server value',
            address: rawData.address?.trim() ? '✓ Modified' : '✗ Using server value',
            city: rawData.city?.trim() ? '✓ Modified' : '✗ Using server value'
        });
        console.log('Final payload to send to backend:', profileData);
        console.log('==================================');

        this.userService.updateUserProfile(userId, profileData).subscribe({
            next: (response) => {
                this.isSaving = false;
                this.successMessage = 'Profile updated successfully!';
                this.passwordConfirmationForm.reset();
                this.showPasswordConfirmation = false;
                this.clearSuccessMessage();
                this.loadProfile(); // Reload to show updated values
            },
            error: (err) => {
                this.isSaving = false;
                const errorMsg = err.error?.error || err.error?.message || 'Failed to update profile. Please try again.';
                this.errorMessage = errorMsg;
                console.error('Error updating profile:', err);
            }
        });
    }

    /**
     * Build full name from first and last name (use server values if not modified)
     */
    private buildFullName(rawData: any): string {
        // Get firstName: use form value if provided (non-empty), otherwise use server value
        const formFirstName = rawData.firstName?.trim?.() || rawData.firstName || '';
        const firstName = (formFirstName.trim() || this.currentUserData?.firstName || '').trim();
        
        // Get lastName: use form value if provided (non-empty), otherwise use server value
        const formLastName = rawData.lastName?.trim?.() || rawData.lastName || '';
        const lastName = (formLastName.trim() || this.currentUserData?.lastName || '').trim();
        
        // Join names with space, only including non-empty parts
        return [firstName, lastName].filter(n => n && n.length > 0).join(' ').trim();
    }

    /**
     * Cancel password confirmation
     */
    cancelPasswordConfirmation(): void {
        this.showPasswordConfirmation = false;
        this.passwordConfirmationForm.reset();
        this.errorMessage = '';
    }

    /**
     * Change password
     */
    onChangePassword(): void {
        if (!this.passwordForm.valid) {
            this.errorMessage = 'Please fill all password fields correctly.';
            return;
        }

        this.isPasswordChanging = true;
        this.errorMessage = '';

        const userId = this.authService.getUserId();
        if (!userId || userId === null) {
            this.errorMessage = 'User ID not found. Please login again.';
            this.isPasswordChanging = false;
            return;
        }

        const passwordData = {
            currentPassword: this.passwordForm.get('currentPassword')?.value,
            newPassword: this.passwordForm.get('newPassword')?.value
        };

        this.userService.changePassword(userId, passwordData).subscribe({
            next: (response) => {
                this.isPasswordChanging = false;
                this.successMessage = 'Password changed successfully!';
                this.passwordForm.reset();
                this.showPasswordForm = false;
                this.clearSuccessMessage();
            },
            error: (err) => {
                this.isPasswordChanging = false;
                // Handle different error scenarios
                if (err.status === 400) {
                    // Bad request - likely "Current password is incorrect"
                    this.errorMessage = err.error?.message || 'Current password is incorrect.';
                } else if (err.status === 404) {
                    // User not found
                    this.errorMessage = 'User not found. Please reload the page.';
                } else if (err.status === 500) {
                    // Server error
                    this.errorMessage = 'Server error. Please try again later.';
                } else {
                    // Generic error
                    this.errorMessage = err.error?.message || 'Failed to change password. Please try again.';
                }
                console.error('Error changing password:', err);
            }
        });
    }

    /**
     * Check if field is invalid and touched
     */
    isFieldInvalid(fieldName: string): boolean {
        const field = this.profileForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    /**
     * Check if password field is invalid and touched
     */
    isPasswordFieldInvalid(fieldName: string): boolean {
        const field = this.passwordForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    /**
     * Toggle password form visibility
     */
    togglePasswordForm(): void {
        this.showPasswordForm = !this.showPasswordForm;
        if (!this.showPasswordForm) {
            this.passwordForm.reset();
        }
    }

    /**
     * Cancel form editing
     */
    onCancel(): void {
        this.loadProfile();
        this.errorMessage = '';
    }

    /**
     * Clear success message after 5 seconds
     */
    private clearSuccessMessage(): void {
        if (this.successTimeout) {
            clearTimeout(this.successTimeout);
        }
        this.successTimeout = setTimeout(() => {
            this.successMessage = '';
        }, 5000);
    }

    /**
     * Validator for minimum length ONLY if field has content
     * Empty fields are valid - user can leave empty to use server value
     */
    private minLengthIfPresent(minLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value?.toString().trim() || '';
            
            // Empty field is valid (will use server value)
            if (!value) {
                return null;
            }
            
            // Check minimum length only if field has content
            if (value.length < minLength) {
                return { 'minlength': { 'requiredLength': minLength, 'actualLength': value.length } };
            }
            
            return null;
        };
    }

    /**
     * Validator for password matching
     */
    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const newPassword = control.get('newPassword')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        if (!newPassword || !confirmPassword) {
            return null;
        }

        return newPassword === confirmPassword ? null : { mismatch: true };
    }

    ngOnDestroy(): void {
        if (this.successTimeout) {
            clearTimeout(this.successTimeout);
        }
    }
}
