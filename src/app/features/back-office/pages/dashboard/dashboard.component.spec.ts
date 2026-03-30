import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    // Mock Chart.js which is used in the component
    (window as any).Chart = class {
      constructor() {}
      static register() {}
      destroy() {}
      update() {}
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DashboardComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UserService,
          useValue: {
            getProfile: () => of({ fullName: 'Admin User' }),
            profile$: of({ fullName: 'Admin User' })
          }
        },
        {
          provide: AuthService,
          useValue: {
            getUserFullName: () => 'Admin User'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (window as any).Chart;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});