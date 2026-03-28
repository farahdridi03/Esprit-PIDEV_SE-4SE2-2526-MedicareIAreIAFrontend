import { TestBed } from '@angular/core/testing';
import { 
  interventionDateValidator, 
  getTodayDateString, 
  getMaxInterventionDateString 
} from '../validators/intervention-date.validator';
import { FormControl, Validators } from '@angular/forms';

describe('Intervention Date Validator', () => {
  let control: FormControl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    control = new FormControl('', [Validators.required, interventionDateValidator(90)]);
  });

  describe('interventionDateValidator', () => {
    it('should create', () => {
      expect(interventionDateValidator).toBeDefined();
    });

    it('should return null for today', () => {
      const today = getTodayDateString();
      control.setValue(today);
      expect(control.errors).toBeNull();
    });

    it('should return null for valid future date within 90 days', () => {
      const validDate = getMaxInterventionDateString(45);
      control.setValue(validDate);
      expect(control.errors).toBeNull();
    });

    it('should reject past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      control.setValue(dateStr);
      expect(control.hasError('pastDate')).toBeTruthy();
    });

    it('should reject dates beyond max days', () => {
      const tooFar = new Date();
      tooFar.setDate(tooFar.getDate() + 91);
      const dateStr = tooFar.toISOString().split('T')[0];
      
      control.setValue(dateStr);
      expect(control.hasError('tooFarInFuture')).toBeTruthy();
    });

    it('should reject empty value as required', () => {
      control.setValue('');
      expect(control.hasError('required')).toBeTruthy();
    });
  });

  describe('getTodayDateString', () => {
    it('should return a valid date string', () => {
      const result = getTodayDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return today date', () => {
      const result = getTodayDateString();
      const date = new Date(result);
      const today = new Date();
      expect(date.toDateString()).toBe(today.toDateString());
    });
  });

  describe('getMaxInterventionDateString', () => {
    it('should return a valid date string', () => {
      const result = getMaxInterventionDateString(90);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return date approximately 90 days ahead', () => {
      const result = getMaxInterventionDateString(90);
      const date = new Date(result);
      const today = new Date();
      const diffTime = Math.abs(date.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(90);
    });

    it('should support custom day count', () => {
      const result = getMaxInterventionDateString(30);
      const date = new Date(result);
      const today = new Date();
      const diffTime = Math.abs(date.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(30);
    });
  });
});
