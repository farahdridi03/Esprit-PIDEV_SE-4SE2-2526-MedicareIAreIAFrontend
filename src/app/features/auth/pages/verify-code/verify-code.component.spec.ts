import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { VerifyCodeComponent } from './verify-code.component';
import { AuthService } from '../../../../services/auth.service';

describe('VerifyCodeComponent', () => {
  let component: VerifyCodeComponent;
  let fixture: ComponentFixture<VerifyCodeComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['verifyGoogleAuth', 'getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ VerifyCodeComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ email: 'test@example.com' })
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localStorage.clear();
  });

  it('should create and initialize with email from queryParams', () => {
    expect(component).toBeTruthy();
    expect(component.verifyForm.get('email')?.value).toBe('test@example.com');
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.verifyForm.invalid).toBeTrue();
    });

    it('should validate email format', () => {
      const email = component.verifyForm.controls['email'];
      email.setValue('invalid-email');
      expect(email.errors?.['email']).toBeTruthy();
    });

    it('should validate code length (must be 6 digits)', () => {
      const code = component.verifyForm.controls['code'];
      code.setValue('12345');
      expect(code.errors?.['minlength']).toBeTruthy();
      
      code.setValue('123456');
      expect(code.valid).toBeTrue();
      
      code.setValue('1234567');
      expect(code.errors?.['maxlength']).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not call service if form is invalid', () => {
      component.onSubmit();
      expect(authServiceSpy.verifyGoogleAuth).not.toHaveBeenCalled();
    });

    it('should call verifyGoogleAuth and redirect on success', fakeAsync(() => {
      component.verifyForm.patchValue({ email: 'test@example.com', code: '123456' });
      const mockResponse = { token: 'jwt', role: 'ROLE_ADMIN' };
      const responseSubject = new Subject<any>();
      authServiceSpy.verifyGoogleAuth.and.returnValue(responseSubject);

      component.onSubmit();
      expect(component.isLoading).toBeTrue();
      
      responseSubject.next(mockResponse);
      responseSubject.complete();
      tick();

      expect(authServiceSpy.verifyGoogleAuth).toHaveBeenCalledWith('test@example.com', '123456');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle invalid code error (401)', fakeAsync(() => {
      component.verifyForm.patchValue({ email: 'test@example.com', code: '000000' });
      const errorResponse = { status: 401 };
      authServiceSpy.verifyGoogleAuth.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(component.errorMessage).toContain('Code invalide');
      expect(component.isLoading).toBeFalse();
    }));

     it('should handle field-specific server errors', fakeAsync(() => {
      component.verifyForm.patchValue({ email: 'test@example.com', code: '123456' });
      const errorResponse = {
        error: {
          fields: { code: 'Expired code' }
        }
      };
      authServiceSpy.verifyGoogleAuth.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(component.verifyForm.get('code')?.errors?.['serverError']).toBe('Expired code');
    }));
  });

  describe('resendCode', () => {
    it('should show error if email is missing', () => {
      component.verifyForm.patchValue({ email: '' });
      component.resendCode();
      expect(component.errorMessage).toBe('Please enter your email to resend the code.');
    });

    it('should simulate resending the code', fakeAsync(() => {
      spyOn(window, 'alert');
      component.verifyForm.patchValue({ email: 'test@example.com' });
      component.resendCode();
      expect(component.isLoading).toBeTrue();
      
      tick(1000);
      expect(component.isLoading).toBeFalse();
      expect(window.alert).toHaveBeenCalled();
    }));
  });
});
