import { Component, OnInit, NgZone } from '@angular/core';
import { PaymentService } from 'src/app/services/payment.service';
import { getYearlyPrice } from 'src/app/services/plan-display.util';
import { FeaturesService } from '../features.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscriptionplan.component.html',
  styleUrls: ['./subscriptionplans.component.scss'],
})
export class SubscriptionPlansComponent implements OnInit {
  plans: any[] = [];
  loading: boolean = false;
  private paypalScriptLoaded = false;
  public isHighestPlan = false;
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
    private paymentService: PaymentService,
    private ngZone: NgZone,
    private featuresService: FeaturesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlans();
    this.loadUserPlan();
    this.loadCurrentSubscription();
  }

  trackByPlanId(_: number, plan: any): string {
    return String(plan?.id ?? _);
  }

  loadPlans() {
    this.loading = true;
    this.paymentService.getSubscriptionPlans().subscribe({
      next: (plans) => {
        this.plans = plans
          .filter(
            (plan: any) => plan?.name !== 'Ultimate Legacy Creation Plan'
          )
          .map((plan: any) => {
            const featuresList = this.paymentService.normalizePlanFeatures(
              plan.features
            );
            const displayPrice = this.getDisplayYearly(plan);

            return {
              ...plan,
              featuresList: this.mergeAndDedupeFeatures(featuresList),
              displayPrice,
              displayPeriodLabel: '/year',
              displayDurationLabel: '12 months',
              membership: this.getMembershipLabel(plan),
              auto: 'Automatic Renewal.',
            };
          });
        this.plans = this.sortPlansByPrice(this.plans);
        this.loading = false;

        // Initialize PayPal buttons after plans are loaded
        this.loadPayPalScript().then(() => {
          this.renderPayPalButtonsSafely();
        });
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.loading = false;
        // Fallback to default plans if API fails
        this.plans = this.sortPlansByPrice(this.getDefaultPlans());
        this.loadPayPalScript().then(() => {
          this.renderPayPalButtonsSafely();
        });
      },
    });
  }

  getDefaultPlans() {
    return [
      {
        id: 'basic',
        name: 'Advanced Auto-Obituary Plan',
        price: 3,
        membership: this.getMembershipLabel({ price: 3, name: 'Advanced Auto-Obituary Plan' }),
        displayPrice: 36,
        displayPeriodLabel: '/year',
        displayDurationLabel: '12 months',
        auto: 'Automatic Renewal.',
        description:
          'Includes auto-obituary section plus additional life details.',
        featuresList: this.mergeAndDedupeFeatures([
          '1 picture to be used as funeral program cover photo',
          'Grandchildren Names & age • Siblings (Dates & Degrees)',
          'Work Achievements',
          'Education Achievements',
          'When & where you met your spouse',
          'Other',
        ]),
      },
      {
        id: 'standard',
        name: 'Legacy Creation Plan',
        price: 7,
        membership: this.getMembershipLabel({ price: 7, name: 'Legacy Creation Plan' }),
        displayPrice: 84,
        displayPeriodLabel: '/year',
        displayDurationLabel: '12 months',
        auto: 'Automatic Renewal.',
        description:
          'Leave the comfort of the sound of your voice. Make a video of you talking/singing etc. (Look in the section for talking topics.) Auto-obituary plan plus video memories, pictures, audio notes and short stories. Highlight your achievements over the years.',
        featuresList: this.mergeAndDedupeFeatures([
          'Record up to ten 3-minute videos a year',
          'Upload up to 30 pictures w/ audio recorded descriptions.',
        ]),
      },
      // {
      //   id: 'premium',
      //   name: 'Ultimate Legacy Creation Plan',
      //   price: 11,
      //   membership: 'One Year Membership $132',
      //   displayPrice: 132,
      //   displayPeriodLabel: '/month',
      //   displayDurationLabel: '1 month',
      //   auto: 'Automatic Renewal.',
      //   description:
      //     'Includes legacy creation plan plus additional videos, pictures and audio notes.',
      //   featuresList: this.mergeAndDedupeFeatures([
      //     // 'Records an additional three minute video',
      //     // 'Show as seen at the end',
      //     'Includes additional 60 pictures & 20 audio notes.',
      //   ]),
      // },
    ];
  }

  private mergeAndDedupeFeatures(existing: any[]): string[] {
    const merged: string[] = [];
    const seen = new Set<string>();
    const add = (item: any) => {
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

    (existing || []).forEach(add);
    this.NEW_FEATURE_BULLETS.forEach(add);
    return merged;
  }

  private loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.paypalScriptLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${'ARNps61AVXJjxC1ArcGk1cA0kMyocB7SoilcRsnP2bfJB2EWXenlcUIe4PxNiTdWd5s6W0mq8SL2HC61'}&currency=USD`;

      script.onload = () => {
        this.paypalScriptLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('PayPal SDK could not be loaded:', error);
        reject(error);
      };

      document.body.appendChild(script);
    });
  }

  private renderPayPalButtonsSafely(): void {
    if (!(window as any)?.paypal?.Buttons) {
      return;
    }

    // Defer until Angular has rendered the containers for current plans
    setTimeout(() => {
      this.plans.forEach((plan) => {
        const container = document.getElementById(`paypal-button-${plan.id}`);
        if (!container) return;

        // Clear any previous render to avoid stale bindings
        container.innerHTML = '';

        const chargeAmount = this.getEffectiveYearlyForPlan(plan);

      // Check if we're in development mode
      const isDev =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        true ||
        window.location.port === '4200';

      if (isDev) {
        // Add a fake purchase button for dev environment
        const fakeButton = document.createElement('button');
        fakeButton.className = 'btn btn-primary w-100 mt-3';
        fakeButton.style.cssText =
          'padding: 12px; font-size: 16px; font-weight: bold; background: #FFD700; color: #2c3e50; border: none;';
        fakeButton.textContent = `[DEV MODE] Subscribe for $${chargeAmount}/year`;
        fakeButton.onclick = () => {
          if (
            confirm(
              `[DEV MODE] This will create a fake subscription for $${chargeAmount}/year.\n\nPlan: ${plan.name}\n\nContinue?`
            )
          ) {
            this.fakePurchase(plan);
          }
        };
        container.appendChild(fakeButton);
      } else {
        // Load PayPal SDK for production
        this.loadPayPalScript().then(() => {
          if ((window as any).paypal) {
            // @ts-ignore
            window.paypal
              .Buttons({
                createOrder: () => {
                  return this.paymentService
                    .createOrder(this.getEffectiveYearlyForPlan(plan), plan.id)
                    .toPromise()
                    .then((response) => response?.orderId ?? '');
                },
                onApprove: (data: any) => {
                  return this.ngZone.run(() => {
                    return this.paymentService
                      .capturePayment(data.orderID, plan.id)
                      .toPromise()
                      .then((details) => {
                        alert('Transaction completed successfully!');
                        // Handle successful subscription
                        window.location.reload();
                      })
                      .catch((error) => {
                        console.error('Payment capture failed:', error);
                        alert('Transaction failed. Please try again.');
                      });
                  });
                },
                onError: (err: any) => {
                  console.error('PayPal button error:', err);
                  alert('An error occurred. Please try again later.');
                },
              })
              .render(`#paypal-button-${plan.id}`);
          }
        });
      }
      });
    }, 0);
  }

  private fakePurchase(plan: any) {
    // Create a fake order ID
    const fakeOrderId = `dev-order-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const chargeAmount = this.getEffectiveYearlyForPlan(plan);

    // Call the backend with fake order ID
    this.paymentService.capturePayment(fakeOrderId, plan.id).subscribe({
      next: (details) => {
        alert(
          `[DEV MODE] Fake subscription created successfully!\n\nPlan: ${plan.name}\nPrice: $${chargeAmount}/year\n\nYou can now test subscription features.`
        );
        // Redirect to dashboard to test subscription features
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      },
      error: (error) => {
        console.error('Fake purchase failed:', error);
        alert(
          `Fake purchase failed: ${
            error.error?.message || error.message
          }\n\nCheck backend logs and ensure NODE_ENV is set to 'development'.`
        );
      },
    });
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
        this.resetPaypalContainers();
        this.renderPayPalButtonsSafely();
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
        ? Number(raw.replace(/[^0-9.]/g, ''))
        : Number(raw);
    return Number.isFinite(num) ? num : 0;
  }

  private getCurrentYearlyPrice(): number {
    if (!this.currentSubscription?.plan) return 0;
    return getYearlyPrice(this.currentSubscription.plan);
  }

  private getEffectiveYearlyCharge(plan: any): number {
    const yearly = getYearlyPrice(plan);
    const currentYearly = this.getCurrentYearlyPrice();

    if (yearly === 84 && currentYearly === 36) {
      return 48;
    }
    return yearly;
  }

  // Effective yearly amount for BOTH display + PayPal charge
  // - Normal: plan.price * 12 (84 for $7)
  // - Upgrade: if user has active $36 plan AND this plan is $84 => charge 48
  getEffectiveYearlyForPlan(plan: any): number {
    return Number(this.getDisplayYearly(plan));
  }

  private hasBasic36Active(): boolean {
    const plan = this.currentSubscription?.plan || null;
    if (!plan) return false;
    const yearly = getYearlyPrice(plan);
    return yearly === 36;
  }

  private isPremium84Plan(plan: any): boolean {
    const yearly = getYearlyPrice(plan);
    return yearly === 84;
  }

  getYearlyFromMonthly(plan: any): number {
    return this.getMonthlyPrice(plan) * 12;
  }

  getDisplayYearly(plan: any): number {
    const yearly = getYearlyPrice(plan);
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

  private sortPlansByPrice(plans: any[]): any[] {
    const list = Array.isArray(plans) ? [...plans] : [];
    list.sort((a, b) => this.getMonthlyPrice(a) - this.getMonthlyPrice(b));
    return list;
  }

  private resetPaypalContainers(): void {
    (this.plans || []).forEach((plan: any) => {
      const id = `paypal-button-${plan.id}`;
      const el = document.getElementById(id);
      if (!el) return;
      (el as any).__paypalRendered = false;
      el.innerHTML = '';
    });
  }

  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }
}
