import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FeaturesService } from '../../features.service';
import { SharedService } from 'src/app/services/shared.service';
import {
  ADMIN_SIDE_NAVIGATION,
  SIDE_NAVIGATION,
} from 'src/app/constants/app.constant';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {
  constructor(
    private readonly router: Router,
    private readonly featuresService: FeaturesService,
    private readonly sharedService: SharedService
  ) {}
  public activeItem: any = [];
  public navList: any = [];
  public isCollapsed = false;
  //   public activeItemLink: string = '/users';

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  getUserPlan() {
    this.featuresService.getUserPlan().subscribe({
      next: (res: any) => {
        if (res?.plan?.screens?.length) {
          this.navList = ADMIN_SIDE_NAVIGATION.filter((x) =>
            res.plan.screens.find((y: any) => y.name == x.name)
          );
          console.log('Filtered navigation list:', this.navList);
        } else {
          console.warn('No screens found in user plan');
          this.navList = SIDE_NAVIGATION; // Fallback to show all navigation items
        }
        this.subscribeToEvent();
        if (this.navList.length) {
          this.router.navigate([`${this.navList[0]?.link}`]);
        }
      },
      error: (err) => {
        console.error('Error fetching user plan:', err);
        this.navList = SIDE_NAVIGATION; // Fallback to show all navigation items
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
        // this.updateActiveNav(event.urlAfterRedirects);
      }
    });
  }
  //   updateActiveNav(activeItemLink: string) {
  //     this.activeItemLink = activeItemLink;
  //     this.activeItem = this.navList.find(
  //       (x: any) => x.link == activeItemLink
  //     )?.name;
  //   }
}
