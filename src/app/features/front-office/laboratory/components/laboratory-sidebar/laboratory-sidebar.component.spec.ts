import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LaboratoryStaffSidebarComponent } from './laboratory-sidebar.component';
import { AuthService } from '../../../../../services/auth.service';

describe('LaboratoryStaffSidebarComponent', () => {
  let component: LaboratoryStaffSidebarComponent;
  let fixture: ComponentFixture<LaboratoryStaffSidebarComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      declarations: [ LaboratoryStaffSidebarComponent ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaboratoryStaffSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.logout on logout()', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
