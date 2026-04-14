import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
  isMobileMenuOpen = false;
  constructor(private router: Router, private soundService: SoundService) {}

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 1024 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const navbar = document.querySelector('.legacy-header');
    if (this.isMobileMenuOpen && navbar && !navbar.contains(target)) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  goToPage(type: string) {
    this.soundService.playClickSound();
    this.router.navigate([`/${type}`]);
    this.isMobileMenuOpen = false;
  }
}
