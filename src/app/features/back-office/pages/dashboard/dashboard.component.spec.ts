import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
import { of } from 'rxjs';
import { ComponentFixture } from '@angular/core/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {

    // Mock global Chart
    (window as any).Chart = class {
      constructor() {}
      static register() {}
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DashboardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UserService,
          useValue: {
            getProfile: () => of({ fullName: 'Admin User' })
          }
        },
        {
          provide: AuthService,
          useValue: {
            getUserFullName: () => 'Admin User'
          }
        }
      ]

    })
    .compileComponents();

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
