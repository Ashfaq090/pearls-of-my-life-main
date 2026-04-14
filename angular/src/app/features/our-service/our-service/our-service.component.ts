import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';
interface PlanCard {
  title: string;
  price: number;
  description: string;
  features: string[];
  gradient: string;
}
@Component({
  selector: 'app-our-service',
  templateUrl: './our-service.component.html',
  styleUrls: ['./our-service.component.scss'],
})
export class OurServiceComponent {
  constructor(private router: Router, private soundService: SoundService) {}

  planCards: PlanCard[] = [
    {
      title: 'Auto Obituary Plan',
      price: 0,
      description:
        'This plan allows you to create an obituary that will be automatically generated based on the information you provide. It includes basic details about your life, achievements, and family.',
      features: [
        'Create a basic obituary with essential details.',
        'Includes family information and achievements.',
      ],
      gradient: 'yellow',
    },
    {
      title: 'Advanced Auto-Obituary Plan',
      price: 3,
      description:
        'Leave the comfort of the sound of your voice. Make a video of you talking singing etc. (Look in the Moments to share section for talking topics). Includes the auto-obituary plan plus video memories, picture stories, audio notes.',
      features: [
        'Record up to five – 3 minute videos per year.',
        'Show up to 10 family pictures w/ audio recorded descriptions.',
      ],
      gradient: 'blue',
    },
  ];

  scrollToTop() {
    this.soundService.playClickSound();
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/subscription-plans']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  // NEW: navigate to a path (used for the Legacy CTA)
  goToPage(path: string) {
    this.soundService.playClickSound();
    this.router.navigate([`/${path}`]).then(() => {
      // ensure page is at top after navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
