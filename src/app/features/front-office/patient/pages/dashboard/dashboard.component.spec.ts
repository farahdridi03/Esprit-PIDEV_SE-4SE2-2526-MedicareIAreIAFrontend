import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DashboardComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserService, useValue: { getProfile: () => of({ fullName: 'John Doe' }) } },
        { provide: AuthService, useValue: { getUserFullName: () => 'John Doe', getUserRole: () => 'PATIENT' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
