import { TestBed } from '@angular/core/testing';
import { birthDateValidator, getEighteenYearsAgoDate, calculateAge } from '../validators/birth-date.validator';
import { FormControl, Validators } from '@angular/forms';

describe('Birth Date Validator', () => {
  let control: FormControl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    control = new FormControl('', [Validators.required, birthDateValidator()]);
  });

  describe('birthDateValidator', () => {
    it('should create', () => {
      expect(birthDateValidator).toBeDefined();
    });

    it('should return null for valid birthdate', () => {
      const validDate = '2000-01-01';
      control.setValue(validDate);
      expect(control.errors).toBeNull();
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      control.setValue(dateStr);
      expect(control.hasError('futureDate')).toBeTruthy();
    });

    it('should reject dates less than 18 years old', () => {
      const tooYoung = new Date();
      tooYoung.setFullYear(tooYoung.getFullYear() - 17);
      const dateStr = tooYoung.toISOString().split('T')[0];
      
      control.setValue(dateStr);
      expect(control.hasError('minAge')).toBeTruthy();
    });

    it('should reject dates more than 120 years old', () => {
      const tooOld = new Date();
      tooOld.setFullYear(tooOld.getFullYear() - 121);
      const dateStr = tooOld.toISOString().split('T')[0];
      
      control.setValue(dateStr);
      expect(control.hasError('maxAge')).toBeTruthy();
    });

    it('should accept exactly 18 years old', () => {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      const dateStr = eighteenYearsAgo.toISOString().split('T')[0];
      
      control.setValue(dateStr);
      expect(control.errors).toBeNull();
    });
  });

  describe('getEighteenYearsAgoDate', () => {
    it('should return a valid date string', () => {
      const result = getEighteenYearsAgoDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return a date approximately 18 years ago', () => {
      const result = getEighteenYearsAgoDate();
      const date = new Date(result);
      const age = calculateAge(date);
      expect(age).toBeGreaterThanOrEqual(17);
      expect(age).toBeLessThanOrEqual(18);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = '2000-01-01';
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThan(20);
      expect(age).toBeLessThan(30);
    });

    it('should handle date objects', () => {
      const birthDate = new Date('2000-01-01');
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThan(20);
    });
  });
});
