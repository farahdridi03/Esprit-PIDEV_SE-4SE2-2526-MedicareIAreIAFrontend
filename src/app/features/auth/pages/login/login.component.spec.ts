import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login', 'getUserRole']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email format', () => {
    const email = component.loginForm.get('email');
    email?.setValue('invalid-email');
    expect(email?.hasError('email')).toBeTrue();
    email?.setValue('valid@example.com');
    expect(email?.hasError('email')).toBeFalse();
  });

  it('should call authService.login on valid form submission', fakeAsync(() => {
    const loginData = { email: 'test@test.com', password: 'password123', rememberMe: false };
    component.loginForm.setValue(loginData);
    authServiceSpy.login.and.returnValue(of({ token: 'abc', role: 'ADMIN', email: 'admin@test.com' }));
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.onSubmit();
    tick();

    expect(authServiceSpy.login).toHaveBeenCalledWith(loginData);
    expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  }));

  it('should redirect PHARMACIST to /front/pharmacist', fakeAsync(() => {
    component.loginForm.setValue({ email: 'p@p.com', password: 'p', rememberMe: false });
    authServiceSpy.login.and.returnValue(of({ token: 'abc', role: 'PHARMACIST', email: 'p@p.com' }));
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/front/pharmacist']);
  }));

  it('should show error message on login failure', () => {
    component.loginForm.setValue({ email: 'bad@test.com', password: 'bad', rememberMe: false });
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should mark all fields as touched if form is invalid', () => {
    component.loginForm.setValue({ email: '', password: '', rememberMe: false });
    component.onSubmit();
    expect(component.loginForm.touched).toBeTrue();
    expect(component.errorMessage).toContain('Veuillez remplir correctement');
  });
});
