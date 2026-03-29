import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    // Mock Chart.js before it's accessed in ngAfterViewInit
    (window as any).Chart = class {
      constructor() {}
      destroy() {}
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
