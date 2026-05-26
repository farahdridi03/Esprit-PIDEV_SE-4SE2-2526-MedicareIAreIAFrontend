import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for date of birth
 * Rules:
 * - Date must not be in the future
 * - User must be at least 18 years old
 * - User must not be more than 120 years old
 */
export function birthDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        const birthDate = new Date(control.value);
        const today = new Date();

        // Set times to midnight to avoid time zone issues
        birthDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        // Check if date is in the future
        if (birthDate > today) {
            return { futureDate: true };
        }

        // Calculate age
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Check minimum age (18 years)
        if (age < 18) {
            return { minAge: { requiredAge: 18, actualAge: age } };
        }

        // Check maximum age (120 years)
        if (age > 120) {
            return { maxAge: { maxAge: 120 } };
        }

        return null;
    };
}

/**
 * Get a human-readable age validation error message
 */
export function getBirthDateErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
        return '';
    }

    if (errors['required']) {
        return 'Date of birth is required';
    }

    if (errors['futureDate']) {
        return 'Date of birth cannot be in the future';
    }

    if (errors['minAge']) {
        const requiredAge = errors['minAge'].requiredAge;
        const actualAge = errors['minAge'].actualAge;
        return `You must be at least ${requiredAge} years old (you are ${actualAge} years old)`;
    }

    if (errors['maxAge']) {
        return 'Date of birth appears to be invalid';
    }

    return 'Date validation error';
}

/**
 * Get age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Get the maximum date allowed (today)
 */
export function getMaxBirthDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Get the minimum birth date (120 years ago)
 */
export function getMinBirthDate(): string {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    return minDate.toISOString().split('T')[0];
}

/**
 * Get the birth date for 18 years old (oldest allowed date)
 */
export function getEighteenYearsAgoDate(): string {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);
    return maxDate.toISOString().split('T')[0];
}
