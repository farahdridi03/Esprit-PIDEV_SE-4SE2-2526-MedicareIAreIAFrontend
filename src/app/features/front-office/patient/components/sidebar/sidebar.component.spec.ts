import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PatientSidebarComponent } from './sidebar.component';
import { AuthService } from '../../../../../services/auth.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PatientSidebarComponent', () => {
  let component: PatientSidebarComponent;
  let fixture: ComponentFixture<PatientSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PatientSidebarComponent],
      providers: [
        { provide: AuthService, useValue: { logout: jasmine.createSpy('logout') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.logout on logout()', () => {
    const authService = TestBed.inject(AuthService);
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });
});