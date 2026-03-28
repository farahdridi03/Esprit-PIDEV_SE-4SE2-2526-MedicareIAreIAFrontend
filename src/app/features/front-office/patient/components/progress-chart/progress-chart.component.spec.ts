import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressChartComponent } from './progress-chart.component';
import { SimpleChange } from '@angular/core';

describe('ProgressChartComponent', () => {
  let component: ProgressChartComponent;
  let fixture: ComponentFixture<ProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle empty data', () => {
    component.data = [];
    component.generateChart();
    expect(component.chartPath).toBe('');
    expect(component.points.length).toBe(0);
  });

  it('should generate points and path for multiple data items', () => {
    component.data = [
      { date: '2026-03-01', value: 10 },
      { date: '2026-03-02', value: 20 },
      { date: '2026-03-03', value: 15 }
    ];
    
    // Simulate ngOnChanges
    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    });

    expect(component.points.length).toBe(3);
    expect(component.chartPath).toContain('M');
    expect(component.chartPath).toContain('L');
    
    // Verify sorting (if input was unsorted)
    component.data = [
        { date: '2026-03-03', value: 15 },
        { date: '2026-03-01', value: 10 },
        { date: '2026-03-02', value: 20 }
    ];
    component.generateChart();
    expect(component.points[0].value).toBe(10); // Should be first after sort
    expect(component.points[2].value).toBe(15); // Should be last after sort
  });

  it('should generate a horizontal line for single data point', () => {
    component.data = [{ date: '2026-03-01', value: 10 }];
    component.generateChart();
    
    expect(component.points.length).toBe(1);
    expect(component.chartPath).toContain('M');
    expect(component.chartPath).toContain('L');
    // Check if it's a small line around the point (from code: M x-10 y L x+10 y)
    const points = component.points[0];
    expect(component.chartPath).toBe(`M ${points.x - 10} ${points.y} L ${points.x + 10} ${points.y}`);
  });
});
