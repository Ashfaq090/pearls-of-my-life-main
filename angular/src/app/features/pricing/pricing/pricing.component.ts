import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent implements OnInit {
  public isHighestPlan = false;

  constructor(
    private router: Router,
    private soundService: SoundService,
    private featuresService: FeaturesService
  ) {}

  ngOnInit(): void {
    this.loadUserPlan();
  }
  getPlanColor(planName: string): string {
    switch (planName) {
      case 'Auto-Obituary':
        return '#FFA500'; // Orange
      case 'Advanced Auto-Obituary':
        return '#32CD32'; // Lime Green
      case 'Legacy Creation':
        return '#9370DB'; // Medium Purple
      case 'Ultimate Legacy Creation':
        return '#FF6347'; // Tomato
      default:
        return '#4CAF50'; // Default Green
    }
  }
  scrollToTop() {
    this.soundService.playClickSound();
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/subscription-plans']);
    } else {
      this.router.navigate(['/auth/login']);
    }
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }

  private loadUserPlan(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    this.featuresService.getUserPlan().subscribe({
      next: (res: any) => {
        this.isHighestPlan =
          String(res?.plan?.name || '').toLowerCase() ===
          'legacy creation plan';
      },
      error: () => {
        this.isHighestPlan = false;
      },
    });
  }
}
