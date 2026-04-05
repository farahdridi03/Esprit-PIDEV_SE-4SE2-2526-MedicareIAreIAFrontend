import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PatientProfileComponent } from './patient-profile.component';
import { AuthService } from '../../../../../services/auth.service';

describe('PatientProfileComponent', () => {
  let component: PatientProfileComponent;
  let fixture: ComponentFixture<PatientProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getUserEmail', 'getUserFullName', 'getParentRole', 'getUserGender']);
    
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PatientProfileComponent],
      providers: [
        { provide: AuthService, useValue: spy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    authServiceSpy.getUserEmail.and.returnValue('test@example.com');
    authServiceSpy.getUserFullName.and.returnValue('Test User');
    authServiceSpy.getParentRole.and.returnValue({ label: 'Maman', badge: 'MAMA' });
    authServiceSpy.getUserGender.and.returnValue('FEMALE');

    fixture = TestBed.createComponent(PatientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with user data on init', () => {
    expect(component.profileForm.get('fullName')?.value).toBe('Test User');
    expect(component.profileForm.get('email')?.value).toBe('test@example.com');
    expect(component.profileForm.get('relationship')?.value).toBe('Mama'); // Based on hardcoded mock in component
    expect(component.isLoading).toBeFalse();
  });

  it('should correctly compute userName', () => {
    authServiceSpy.getUserFullName.and.returnValue('Alice Smith');
    expect(component.userName).toBe('Alice');
    
    authServiceSpy.getUserFullName.and.returnValue(null);
    expect(component.userName).toBe('User');
  });

  it('should handle saveProfile with success state', fakeAsync(() => {
    component.profileForm.patchValue({
      fullName: 'New Name',
      phone: '12345678'
    });
    
    expect(component.profileForm.valid).toBeTrue();
    
    component.saveProfile();
    expect(component.isLoading).toBeTrue();
    
    tick(1000); // Wait for the simulated API call
    expect(component.showSuccess).toBeTrue();
    expect(component.isLoading).toBeFalse();
    
    tick(3000); // Wait for success message to disappear
    expect(component.showSuccess).toBeFalse();
  }));

  it('should not save if form is invalid', () => {
    component.profileForm.patchValue({
      fullName: '', // Invalid
      phone: ''
    });
    
    component.saveProfile();
    expect(component.isLoading).toBeFalse(); // Should stay false as it returns early
    expect(component.showSuccess).toBeFalse();
  });
});
