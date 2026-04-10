import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-front-layout',
  templateUrl: './front-layout.component.html',
  styleUrls: ['./front-layout.component.scss']
})
export class FrontLayoutComponent {
  menuOpen = false;
  isScrolled = false;

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }
}
