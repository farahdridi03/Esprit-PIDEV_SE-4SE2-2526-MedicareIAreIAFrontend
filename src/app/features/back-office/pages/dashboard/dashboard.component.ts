import { Component, AfterViewInit, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';

declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  firstName: string = 'Admin';

  constructor(private userService: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.loadUserInfo();
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user && user.fullName) {
          const parts = user.fullName.split(' ');
          this.firstName = parts[0];
        }
      }
    });
  }

  private loadUserInfo() {
    const fullName = this.authService.getUserFullName();
    if (fullName) {
      const parts = fullName.split(' ');
      this.firstName = parts[0];
    }
  }

  ngAfterViewInit(): void {
    // Growth Chart
    const gCtx = document.getElementById('growthChart') as HTMLCanvasElement;
    if (gCtx) {
      new Chart(gCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            label: 'Users',
            data: [4200, 6800, 9500, 12300, 15800, 18200, 21000, 24891],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.07)',
            borderWidth: 2.5,
            pointBackgroundColor: '#4f46e5',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4
          }, {
            label: 'Donations ($k)',
            data: [8, 12, 18, 22, 31, 38, 43, 48],
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(13,148,136,0.05)',
            borderWidth: 2,
            pointBackgroundColor: '#7c3aed',
            pointRadius: 3,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top', labels: { font: { family: 'Outfit', size: 11 }, boxWidth: 10, color: '#6b6b8a' } }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 11 }, color: '#a8a8c0' }, border: { display: false } },
            y: { grid: { color: '#ebebf5', lineWidth: 1 }, ticks: { font: { family: 'Outfit', size: 11 }, color: '#a8a8c0' }, border: { display: false } }
          }
        }
      });
    }

    // Donut chart
    const rCtx = document.getElementById('roleChart') as HTMLCanvasElement;
    if (rCtx) {
      new Chart(rCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Patients', 'Doctors', 'Moderators', 'Admins'],
          datasets: [{
            data: [18442, 4218, 87, 12],
            backgroundColor: ['#4f46e5', '#7c3aed', '#7c3aed', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { display: true, position: 'right', labels: { font: { family: 'Outfit', size: 11 }, boxWidth: 10, color: '#6b6b8a', padding: 10 } }
          }
        }
      });
    }
  }

}
