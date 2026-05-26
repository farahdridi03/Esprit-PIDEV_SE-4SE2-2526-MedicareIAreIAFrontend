import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test-access',
  templateUrl: './test-access.component.html',
  styleUrls: ['./test-access.component.scss']
})
export class TestAccessComponent {

  interfaces = [
    // 🏥 PATIENT INTERFACES
    { path: '/front/patient/dashboard', label: 'Patient Dashboard', icon: '👤' },
    { path: '/front/patient/pharmacy', label: 'Pharmacy', icon: '💊' },
    { path: '/front/patient/pharmacy-orders', label: 'Orders List', icon: '📦' },
    { path: '/front/patient/pharmacy-orders/new', label: 'Create Order', icon: '➕' },
    { path: '/front/patient/homecare', label: 'Home Care Catalog', icon: '🏥' },

    // 💊 PHARMACIST INTERFACES
    { path: '/front/pharmacist/dashboard', label: 'Pharmacist Dashboard', icon: '💊' },
    { path: '/front/pharmacist/orders', label: 'Pharmacist Orders', icon: '📋' },
    { path: '/front/pharmacist/profile', label: 'Pharmacist Profile', icon: '👤' },
    { path: '/pharmacist/stock/dashboard', label: 'Stock Dashboard', icon: '📊' },
    { path: '/pharmacist/stock/products', label: 'Products', icon: '📦' },
    { path: '/pharmacist/stock/pharmacies', label: 'Pharmacies', icon: '🏪' },
    { path: '/pharmacist/stock/alerts', label: 'Stock Alerts', icon: '🚨' },

    // 👨‍⚕️ DOCTOR INTERFACES
    { path: '/front/doctor/dashboard', label: 'Doctor Dashboard', icon: '👨‍⚕️' },

    // 🏥 CLINIC INTERFACES
    { path: '/front/clinic/dashboard', label: 'Clinic Dashboard', icon: '🏥' },

    // 🏠 HOME CARE INTERFACES
    { path: '/front/home-care/provider-dashboard', label: 'Home Care Provider', icon: '🏠' },

    // 🥗 NUTRITIONIST INTERFACES
    { path: '/front/nutritionist/dashboard', label: 'Nutritionist', icon: '🥗' },

    // 🔬 LABORATORY INTERFACES
    { path: '/front/laboratorystaff', label: 'Laboratory', icon: '🔬' },

    // ⚙️ ADMIN/BACK-OFFICE INTERFACES
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: '⚙️' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/pharmacists/validation', label: 'Pharmacist Validation', icon: '✅' },
    { path: '/admin/providers', label: 'Providers Management', icon: '🤝' },
    { path: '/admin/requests', label: 'Requests', icon: '📬' },
    { path: '/admin/events', label: 'Events Management', icon: '📅' },
    { path: '/admin/events/create', label: 'Create Event', icon: '➕' },
  ];

  constructor(private router: Router) { }

  navigate(path: string) {
    console.log('Navigating to:', path);
    this.router.navigate([path]);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goHome() {
    this.router.navigate(['/front']);
  }
}

