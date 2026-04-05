import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-progress-chart',
  templateUrl: './progress-chart.component.html',
  styleUrls: ['./progress-chart.component.scss']
})
export class ProgressChartComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() title: string = 'Progress Over Time';
  
  chartPath: string = '';
  points: {x: number, y: number, label: string, value: any}[] = [];
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.generateChart();
    }
  }

  generateChart(): void {
    if (!this.data || this.data.length === 0) {
      this.chartPath = '';
      this.points = [];
      return;
    }

    // Sort by date
    const sortedData = [...this.data].sort((a, b) => 
      new Date(a.recordedAt || a.date).getTime() - new Date(b.recordedAt || b.date).getTime()
    );

    const width = 400;
    const height = 150;
    const padding = 20;

    const values = sortedData.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const stepX = (width - padding * 2) / (sortedData.length > 1 ? sortedData.length - 1 : 1);
    
    this.points = sortedData.map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2);
      return {
        x,
        y,
        label: new Date(d.recordedAt || d.date).toLocaleDateString(),
        value: d.value
      };
    });

    if (this.points.length > 1) {
      this.chartPath = `M ${this.points[0].x} ${this.points[0].y} ` + 
        this.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    } else if (this.points.length === 1) {
       this.chartPath = `M ${this.points[0].x - 10} ${this.points[0].y} L ${this.points[0].x + 10} ${this.points[0].y}`;
    }
  }
}
