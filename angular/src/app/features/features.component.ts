import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ADMIN_SIDE_NAVIGATION,
  SIDE_NAVIGATION,
} from '../constants/app.constant';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { FeaturesService } from './features.service';
import { SharedService } from '../services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
})
export class FeaturesComponent implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly featuresService: FeaturesService,
    private readonly sharedService: SharedService
  ) {}

  public navList: any = [];
  public activeItemLink: string = '/dashboard';
  public activeItem: string = 'All Items';
  public isHighestPlan = false;
  public hasAnyPlan = false;
  public currentUserPlanName: string | null = null;
  private lastNavUrl: string = '';
  private debugNavSub?: Subscription;

  public isCollapsed = false;

  ngOnInit(): void {
    // DEBUG_NAV_START
    this.debugNavSub = this.router.events.subscribe((event) => {
      const href = window.location.href;
      if (event instanceof NavigationStart) {
        console.log('DEBUG_NAV: NavigationStart', { url: event.url, href });
      }

      if (event instanceof NavigationEnd) {
        console.log('DEBUG_NAV: NavigationEnd', {
          urlAfterRedirects: event.urlAfterRedirects,
          url: event.url,
          lastUrl: this.lastNavUrl,
          href,
        });

        if (event.urlAfterRedirects.includes('/dashboard')) {
          console.warn('DEBUG_NAV: reached /dashboard', {
            lastUrl: this.lastNavUrl,
            currentUrl: event.urlAfterRedirects,
            href,
          });
        }

        this.lastNavUrl = event.urlAfterRedirects;
      }

      if (event instanceof NavigationCancel) {
        console.warn('DEBUG_NAV: NavigationCancel', {
          url: event.url,
          reason: (event as any).reason,
          href,
        });
      }

      if (event instanceof NavigationError) {
        console.error('DEBUG_NAV: NavigationError', {
          url: event.url,
          error: event.error,
          href,
        });
      }
    });
    // DEBUG_NAV_END
    this.getUserPlan();
  }

  ngOnDestroy(): void {
    if (this.debugNavSub) {
      this.debugNavSub.unsubscribe();
    }
  }

  // getUserPlan() {
  //   this.featuresService.getUserPlan().subscribe({
  //     next: (res: any) => {
  //       if (res?.plan?.screens?.length) {
  //         this.navList = SIDE_NAVIGATION.filter((x) =>
  //           res.plan.screens.find((y: any) => y.name == x.name)
  //         );
  //         console.log('Filtered navigation list:', this.navList);
  //       } else {
  //         console.warn('No screens found in user plan');
  //         this.navList = SIDE_NAVIGATION; // Fallback to show all navigation items
  //       }
  //       this.subscribeToEvent();
  //       if (this.navList.length && !this.activeItemLink) {
  //         this.router.navigate([`${this.navList[0]?.link}`]);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching user plan:', err);
  //       this.navList = SIDE_NAVIGATION; // Fallback to show all navigation items
  //       this.sharedService.showToast({
  //         classname: 'error',
  //         text: err?.error?.message || 'Error loading navigation',
  //       });
  //     },
  //   });
  // }
  getUserPlan() {
    // First check if user is admin or super admin
    if (this.sharedService.isAdmin() || this.sharedService.isSuperAdmin()) {
      this.navList = ADMIN_SIDE_NAVIGATION;
      this.subscribeToEvent();
      if (this.navList.length && !this.activeItemLink) {
        this.router.navigate([`${this.navList[0]?.link}`]);
      }
      return;
    }

    // For non-admin users, proceed with the original logic
    this.featuresService.getUserPlan().subscribe({
      next: (res: any) => {
        let baseNavList = SIDE_NAVIGATION;
        this.isHighestPlan =
          String(res?.plan?.name || '').toLowerCase() ===
          'legacy creation plan';
        this.hasAnyPlan = !!(res?.plan && (res.plan.id || res.plan.name));

        this.currentUserPlanName = res?.plan?.name || null;
        // Add Videos and Audios based on subscription plan
        if (res?.plan) {
          const plan = res.plan;
          const dynamicNav = [...baseNavList];

          // Add Videos if allowed
          if (plan.videoRecordingAllowed || plan.video_recording_allowed) {
            dynamicNav.push({
              name: 'Videos',
              component: 'videos',
              link: '/videos-map',
            });
          }

          // Add Audios if allowed
          if (plan.audioRecordingAllowed || plan.audio_recording_allowed) {
            dynamicNav.push({
              name: 'Audios',
              component: 'audios',
              link: '/audios',
            });
          }

          baseNavList = dynamicNav;
        }

        if (res?.plan?.screens?.length) {
          this.navList = baseNavList.filter((x) =>
            res.plan.screens.find((y: any) => y.name == x.name)
          );
          console.log('Filtered navigation list:', this.navList);
        } else {
          console.warn('No screens found in user plan');
          this.navList = baseNavList; // Fallback to show all navigation items
        }
        this.subscribeToEvent();
        if (this.navList.length && !this.activeItemLink) {
          this.router.navigate([`${this.navList[0]?.link}`]);
        }
      },
      error: (err) => {
        console.error('Error fetching user plan:', err);
        this.navList = SIDE_NAVIGATION; // Fallback to show all navigation items
        this.isHighestPlan = false;
        this.hasAnyPlan = false;
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Error loading navigation',
        });
      },
    });
  }

  subscribeToEvent() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateActiveNav(event.urlAfterRedirects);
      }
    });
  }

  updateActiveNav(activeItemLink: string) {
    const cleanedPath = activeItemLink.split('?')[0].split('#')[0];
    if (/^\/key-holders\/[^/]+$/.test(cleanedPath)) {
      this.activeItemLink = cleanedPath;
      this.activeItem = 'Edit Keyholder';
      return;
    }
    this.activeItemLink = cleanedPath;
    this.activeItem = this.navList.find(
      (x: any) => x.link == cleanedPath
    )?.name;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  goToPricing(): void {
    this.router.navigate(['/pricing']);
  }
}
