import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorSidebarComponent } from './doctor-sidebar.component';
import { AuthService } from '../../../../../services/auth.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DoctorSidebarComponent', () => {
  let component: DoctorSidebarComponent;
  let fixture: ComponentFixture<DoctorSidebarComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      declarations: [ DoctorSidebarComponent ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewChange when setView is called', () => {
    spyOn(component.viewChange, 'emit');
    component.setView('calendar');
    expect(component.viewChange.emit).toHaveBeenCalledWith('calendar');
  });

  it('should call logout on AuthService when logout is called', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
