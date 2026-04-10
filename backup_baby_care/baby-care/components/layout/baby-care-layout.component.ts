import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  route: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-baby-care-layout',
  template: `
    <div class="bc-shell">
      <!-- Main scroll area -->
      <main class="bc-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation -->
      <nav class="bc-nav">
        <a *ngFor="let item of navItems"
           [routerLink]="['/baby-care', item.route]"
           routerLinkActive="bc-nav__item--active"
           class="bc-nav__item"
           [attr.aria-label]="item.label">
          <span class="bc-nav__icon">{{ item.icon }}</span>
          <span class="bc-nav__label">{{ item.label }}</span>
        </a>
      </nav>

      <!-- Toast Notifications -->
      <app-bc-toast></app-bc-toast>
    </div>
  `,
  styleUrls: ['./baby-care-layout.component.scss']
})
export class BabyCareLayoutComponent {
  navItems: NavItem[] = [
    { route: 'dashboard', icon: '🏠', label: 'Home'    },
    { route: 'feeding',   icon: '🤱', label: 'Feed'    },
    { route: 'sleep',     icon: '😴', label: 'Sleep'   },
    { route: 'health',    icon: '🌡️', label: 'Health'  },
    { route: 'vaccines',  icon: '💉', label: 'Vaccines'},
  ];
  constructor(public router: Router) {}
}
