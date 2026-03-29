import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';

class MockChart {
  constructor() {}
  update() {}
  destroy() {}
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    (window as any).Chart = MockChart;

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [DashboardComponent],
      providers: [
        { provide: UserService, useValue: { getProfile: () => of({ id: 1, fullName: 'John Doe', email: 'john@example.com', role: 'ADMIN', enabled: true }) } },
        { provide: AuthService, useValue: { getUserFullName: () => 'John Doe', getUserRole: () => 'ADMIN' } }
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
