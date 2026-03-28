import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { TestingModule } from '../../../../testing/testing.module';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [TestingModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize register form with empty values', () => {
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('fullName')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
    });

    it('should have all required fields', () => {
      expect(component.registerForm.get('fullName')).toBeDefined();
      expect(component.registerForm.get('email')).toBeDefined();
      expect(component.registerForm.get('phone')).toBeDefined();
      expect(component.registerForm.get('birthDate')).toBeDefined();
      expect(component.registerForm.get('role')).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should invalidate empty full name', () => {
      const fullNameControl = component.registerForm.get('fullName');
      fullNameControl?.setValue('');
      fullNameControl?.markAsTouched();
      expect(fullNameControl?.invalid).toBeTruthy();
    });

    it('should invalidate invalid email', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      expect(emailControl?.invalid).toBeTruthy();
    });

    it('should validate correct email', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should invalidate phone number with non-digits', () => {
      const phoneControl = component.registerForm.get('phone');
      phoneControl?.setValue('abc12345');
      phoneControl?.markAsTouched();
      expect(phoneControl?.invalid).toBeTruthy();
    });

    it('should validate phone with 8 digits', () => {
      const phoneControl = component.registerForm.get('phone');
      phoneControl?.setValue('12345678');
      expect(phoneControl?.valid).toBeTruthy();
    });
  });

  describe('Birth Date Validation', () => {
    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];

      const birthDateControl = component.registerForm.get('birthDate');
      birthDateControl?.setValue(dateStr);
      birthDateControl?.markAsTouched();
      expect(birthDateControl?.hasError('futureDate')).toBeTruthy();
    });

    it('should reject dates less than 18 years old', () => {
      const tooYoung = new Date();
      tooYoung.setFullYear(tooYoung.getFullYear() - 17);
      const dateStr = tooYoung.toISOString().split('T')[0];

      const birthDateControl = component.registerForm.get('birthDate');
      birthDateControl?.setValue(dateStr);
      birthDateControl?.markAsTouched();
      expect(birthDateControl?.hasError('minAge')).toBeTruthy();
    });

    it('should accept valid birth date (18+ years old)', () => {
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 25);
      const dateStr = validDate.toISOString().split('T')[0];

      const birthDateControl = component.registerForm.get('birthDate');
      birthDateControl?.setValue(dateStr);
      expect(birthDateControl?.valid).toBeTruthy();
    });
  });

  describe('Role Selection', () => {
    it('should set role value to PATIENT by default', () => {
      expect(component.registerForm.get('role')?.value).toBe('PATIENT');
    });

    it('should have all role options available', () => {
      expect(component.roles.length).toBeGreaterThan(0);
      expect(component.roles.some((r: any) => r.value === 'PATIENT')).toBeTruthy();
    });
  });

  describe('getBirthDateErrorMessage', () => {
    it('should return appropriate error message', () => {
      const birthDateControl = component.registerForm.get('birthDate');
      birthDateControl?.setValue('');
      birthDateControl?.markAsTouched();
      
      const message = component.getBirthDateErrorMessage();
      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(0);
    });
  });
});
