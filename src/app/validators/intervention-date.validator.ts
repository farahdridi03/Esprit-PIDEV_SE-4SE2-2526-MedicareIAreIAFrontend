import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validateur pour les dates d'intervention
 * La date doit être:
 * - Non vide
 * - Aujourd'hui ou dans le futur (pas au passé)
 * - Maximum 90 jours à l'avance
 */
export function interventionDateValidator(maxDaysAhead: number = 90): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        const selectedDate = new Date(control.value);
        const today = new Date();

        // Normaliser les dates à minuit pour éviter les problèmes de timezone
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        // Vérifier que la date n'est pas au passé
        if (selectedDate < today) {
            return { pastDate: true };
        }

        // Vérifier que la date n'est pas trop loin dans le futur
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + maxDaysAhead);

        if (selectedDate > maxDate) {
            return { tooFarInFuture: { maxDays: maxDaysAhead } };
        }

        return null;
    };
}

/**
 * Obtient la date minimale autorisée (aujourd'hui)
 */
export function getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Obtient la date maximale autorisée
 * @param daysAhead Nombre de jours à l'avance
 */
export function getMaxInterventionDateString(daysAhead: number = 90): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + daysAhead);
    return maxDate.toISOString().split('T')[0];
}

/**
 * Obtient le message d'erreur approprié
 */
export function getInterventionDateErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
        return '';
    }

    if (errors['required']) {
        return 'La date d\'intervention est obligatoire';
    }

    if (errors['pastDate']) {
        return 'La date d\'intervention doit être aujourd\'hui ou dans le futur';
    }

    if (errors['tooFarInFuture']) {
        const maxDays = errors['tooFarInFuture'].maxDays;
        return `La date d\'intervention doit être dans les ${maxDays} jours`;
    }

    return 'Date invalide';
}
