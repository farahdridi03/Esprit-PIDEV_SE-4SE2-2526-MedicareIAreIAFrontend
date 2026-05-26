import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for intervention dates
 * The date must be:
 * - Not empty
 * - Today or in the future (not in the past)
 * - Maximum 90 days ahead
 */
export function interventionDateValidator(maxDaysAhead: number = 90): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        const selectedDate = new Date(control.value);
        const today = new Date();

        // Normalize dates to midnight to avoid timezone issues
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Check that date is not in the past
        if (selectedDate < today) {
            return { pastDate: true };
        }

        // Check that date is not too far in the future
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + maxDaysAhead);

        if (selectedDate > maxDate) {
            return { tooFarInFuture: { maxDays: maxDaysAhead } };
        }

        return null;
    };
}

/**
 * Gets the minimum allowed date (today)
 */
export function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Gets the maximum allowed date
 * @param daysAhead Number of days ahead
 */
export function getMaxInterventionDateString(daysAhead: number = 90): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + daysAhead);
    return maxDate.toISOString().split('T')[0];
}

/**
 * Gets the appropriate error message
 */
export function getInterventionDateErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
        return '';
    }

    if (errors['required']) {
        return 'Intervention date is required';
    }

    if (errors['pastDate']) {
        return 'Intervention date must be today or in the future';
    }

    if (errors['tooFarInFuture']) {
        const maxDays = errors['tooFarInFuture'].maxDays;
        return `Intervention date must be within ${maxDays} days`;
    }

    return 'Invalid date';
}
