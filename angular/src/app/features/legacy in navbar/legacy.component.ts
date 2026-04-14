// src/app/pages/legacy/legacy.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { fadeInOnScroll } from '../../services/animations';
import { ButtonComponent } from 'src/app/shared/button/button.component';
import { Router } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';
import { Token } from '@angular/compiler';
import { PaymentService } from 'src/app/services/payment.service';
import { LEGACY_CARDS } from 'src/app/constants/legacy-cards.constant';

interface LegacyCard {
  title: string;
  description: string;
  icon: string;
  gradient: string;
  route?: string;
}

interface PlanCard {
  title: string;
  price: number;
  membership?: string;
  auto?: string;
  description: string;
  features: string[];
  gradient: string;
}

@Component({
  selector: 'app-legacy-navbar',
  // standalone: true,
  // imports: [CommonModule, HeroComponent, ButtonComponent],
  templateUrl: './legacy.component.html',
  styleUrls: ['./legacy.component.scss'],
  // animations: [fadeInOnScroll],
})
export class LegacyNavbarComponent implements OnInit {
  showMomentsModal = false;
  apiPlans: any[] = [];
  planFeaturesMap: Record<string, string[]> = {};
  public currentSubscription: any = null;
  private readonly NEW_FEATURE_BULLETS: string[] = [];
  private readonly REMOVED_FEATURE_BULLETS = [
    'more detailed life information such as achievements, diplomas, friends, employment, etc.',
    'Schools (Dates & Degrees)',
    'Employment (Titles & Dates)',
    'Career Achievements (Titles & Dates)',
    'Church Affiliation /Titles held/ year joined',
    'Other Achievements',
    'Club Memberships',
    'Other Group Affiliations etc',
    'Greatest Friendships',
    'Special Instructions',
  ];

  constructor(
    private router: Router,
    private soundService: SoundService,
    private paymentService: PaymentService
  ) {}
  legacyCards: LegacyCard[] = LEGACY_CARDS;

  planCards: PlanCard[] = [
    // {
    //   title: 'Auto Obituary Plan',
    //   price: 0,
    //   description:
    //     'This plan allows you to create an obituary that will be automatically generated based on the information you provide. It includes basic details about your life, achievements, and family.',
    //   features: [
    //     'Create a basic obituary with essential details.',
    //     'Includes family information and achievements.',
    //   ],
    //   gradient: 'yellow',
    // },
    // {
    //   title: 'Advanced Auto-Obituary Plan',
    //   price: 3,
    //   description:
    //     'Leave the comfort of the sound of your voice. Make a video of you talking singing etc. (Look in the Moments to share section for talking topics). Includes the auto-obituary plan plus video memories, picture stories, audio notes.',
    //   features: [
    //     'Record up to five – 3 minute videos per year.',
    //     'Show up to 10 family pictures w/ audio recorded descriptions.',
    //   ],
    //   gradient: 'blue',
    // },
    {
      title: 'Legacy Creation Plan',
      price: 7,
      membership: 'Monthly price $7',
      auto: 'Automatic Renewal',
      description:
        'Leave the comfort of the sound of your voice. Make a video of you talking singing etc. (Look in the Moments to share section for talking topics). Includes the advanced auto-obituary plan plus video memories, picture stories, audio notes. Highlight your significant moments in past, present & future years.',
      features: [
        'Record up to ten – 3 minute videos per year.',
        'Show up to 30 family pictures w/ audio recorded descriptions.',
      ],
      gradient: 'yellow',
    },
    // {
    //   title: 'Ultimate Legacy Creation Plan',
    //   price: 11,
    //   membership: 'One Year Membership $132',
    //   auto: 'Automatic Renewal',
    //   description:
    //     'Includes legacy creation plan plus additional videos, pictures and audio notes.',
    //   features: [
    //     'Records an additional 40 ??? three minute videos per year.',
    //     'Show an additional 60 pictures with audio notes.',
    //   ],
    //   gradient: 'yellow',
    // },
  ];

  ngOnInit() {
    this.initScrollAnimation();
    this.loadSubscriptionPlans();
    this.loadCurrentSubscription();
  }

  private loadSubscriptionPlans(): void {
    this.paymentService.getSubscriptionPlans().subscribe({
      next: (plans) => {
        const filtered = plans.filter(
          (plan: any) => plan?.name !== 'Ultimate Legacy Creation Plan'
        );

        this.apiPlans = filtered.map((plan: any) => {
          const fallback = this.planCards.find(
            (p) => this.normalizePlanName(p.title) === this.normalizePlanName(plan.name)
          );
          const features = this.paymentService.normalizePlanFeatures(
            plan.features
          );
          const merged = this.mergeAndDedupeFeatures(features);
          const displayPrice = this.getDisplayYearly(plan);
          return {
            ...plan,
            title: plan.name,
            featuresList: merged,
            gradient: fallback?.gradient ?? 'yellow',
            displayPrice,
            displayPeriodLabel: '/year',
            displayDurationLabel: '12 months',
            membership: this.getMembershipLabel(plan),
            auto: 'Automatic Renewal',
          };
        });
      },
      error: () => {
        this.apiPlans = [];
      },
    });
  }

  private normalizeFeatures(features: any): string[] {
    if (!features) return [];
    if (Array.isArray(features)) return features.map((f) => String(f));
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed.map((f) => String(f));
      } catch {
        return features.split(',').map((f) => f.trim());
      }
    }
    return [];
  }

  private mergeAndDedupeFeatures(existing: string[]): string[] {
    const merged: string[] = [];
    const seen = new Set<string>();
    const add = (item: string) => {
      const value = String(item).trim();
      if (
        this.REMOVED_FEATURE_BULLETS.some(
          (removed) => removed.toLowerCase() === value.toLowerCase()
        )
      ) {
        return;
      }
      if (!value || seen.has(value)) return;
      seen.add(value);
      merged.push(value);
    };

    existing.forEach(add);
    this.NEW_FEATURE_BULLETS.forEach(add);
    return merged;
  }

  private normalizePlanName(name: string): string {
    return String(name || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  getPlanFeatures(planTitle: string, fallback: string[]): string[] {
    const key = this.normalizePlanName(planTitle);
    return this.planFeaturesMap[key] ?? fallback;
  }

  private loadCurrentSubscription(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    this.paymentService.getCurrentSubscription().subscribe({
      next: (res: any) => {
        const normalized =
          res?.data ?? res?.subscription ?? res?.currentSubscription ?? res;
        if (normalized?.plan) {
          this.currentSubscription = normalized;
        } else if (normalized?.name || normalized?.price) {
          this.currentSubscription = { plan: normalized };
        } else {
          this.currentSubscription = null;
        }
      },
      error: () => {
        this.currentSubscription = null;
      },
    });
  }

  private getMonthlyPrice(plan: any): number {
    const raw = plan?.price ?? plan?.monthlyPrice ?? plan?.amount ?? 0;
    const num =
      typeof raw === 'string'
        ? Number(String(raw).replace(/[^0-9.]/g, ''))
        : Number(raw);
    return Number.isFinite(num) ? num : 0;
  }

  private getCurrentYearlyPrice(): number {
    if (!this.currentSubscription?.plan) return 0;
    const plan = this.currentSubscription.plan;
    const monthly = Number(plan?.price ?? 0);
    const annual = Number(plan?.annual_price ?? 0);
    return annual > 0 ? annual : monthly * 12;
  }

  private hasBasic36Active(): boolean {
    return this.getCurrentYearlyPrice() === 36;
  }

  private isPremium84Plan(plan: any): boolean {
    const monthly = this.getMonthlyPrice(plan);
    const annual = Number(plan?.annual_price ?? 0);
    const yearly = annual > 0 ? annual : monthly * 12;
    return yearly === 84;
  }

  getDisplayYearly(plan: any): number {
    const monthly = this.getMonthlyPrice(plan);
    const annual = Number(plan?.annual_price ?? 0);
    const yearly = annual > 0 ? annual : monthly * 12;
    if (this.isPremium84Plan(plan) && this.hasBasic36Active()) {
      return 48;
    }
    return yearly;
  }

  getDisplayMonthly(plan: any): number {
    if (this.isPremium84Plan(plan) && this.hasBasic36Active()) {
      return 4;
    }
    return this.getMonthlyPrice(plan);
  }

  getMembershipLabel(plan: any): string {
    const monthly = this.getDisplayMonthly(plan);
    return `Monthly price $${monthly}`;
  }

  private initScrollAnimation() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      document
        .querySelectorAll('.legacy-cards-section, .plan-cards-section')
        .forEach((section) => observer.observe(section));
    }, 100);
  }

  openMomentsModal() {
    this.showMomentsModal = true;
  }

  closeMomentsModal() {
    this.showMomentsModal = false;
  }
  scrollToTop() {
    this.soundService.playClickSound();
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
  handleMomentsToShareClick(event: Event) {
    this.soundService.playClickSound();
    this.showMomentsModal = true;
    event.preventDefault();
    // Your specific logic for Moments to Share
  }

  handleCardClick(card: LegacyCard, event: Event) {
    if (card.title === 'Moments to Share') {
      this.handleMomentsToShareClick(event);
      return;
    }

    if (card.route) {
      return;
    }

    this.handleDefaultLearnMore(event);
  }

  handleDefaultLearnMore(event: Event) {
    this.soundService.playClickSound();
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
