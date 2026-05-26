import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
<<<<<<< HEAD

<<<<<<< HEAD
import { PatientSidebarComponent } from './sidebar.component';
import { AuthService } from '../../../../../services/auth.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PatientSidebarComponent', () => {
  let component: PatientSidebarComponent;
  let fixture: ComponentFixture<PatientSidebarComponent>;
=======
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../../../services/auth.service';
=======
import { SidebarComponent } from './sidebar.component';
import { TestingModule } from '../../../../../testing/testing.module';
>>>>>>> aziz

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
>>>>>>> origin/frontVersion1

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
<<<<<<< HEAD
<<<<<<< HEAD
      imports: [HttpClientTestingModule],
      declarations: [PatientSidebarComponent],
      providers: [
        { provide: AuthService, useValue: { logout: jasmine.createSpy('logout') } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
=======

      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SidebarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]


>>>>>>> origin/frontVersion1
=======
      declarations: [SidebarComponent],
      imports: [TestingModule],
      schemas: [NO_ERRORS_SCHEMA]
>>>>>>> aziz
    })
      .compileComponents();

    fixture = TestBed.createComponent(PatientSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
<<<<<<< HEAD

<<<<<<< HEAD
  it('should call authService.logout on logout()', () => {
    const authService = TestBed.inject(AuthService);
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
=======
  it('should call authService.logout when logout is called', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
>>>>>>> origin/frontVersion1
  });
=======
>>>>>>> aziz
});