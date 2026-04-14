import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SharedService } from '../services/shared.service';
import { PaymentService } from '../services/payment.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionGuard implements CanActivate {
  constructor(
    private sharedService: SharedService,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const userToken = this.sharedService.userToken;
    if (!userToken) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Allow access to obituary-info for all authenticated users
    if (
      next.routeConfig &&
      next.routeConfig.path &&
      next.routeConfig.path.startsWith('obituary-info')
    ) {
      return true;
    }

    // Check subscription from API (not JWT token which doesn't update after purchase)
    return this.paymentService.getCurrentSubscription().pipe(
      map((subscription: any) => {
        // Check if user has an active subscription
        // Handle both null response and inactive status
        if (
          subscription &&
          subscription.status === 'active' &&
          subscription.plan
        ) {
          return true;
        }
        // No active subscription, redirect to plans
        this.sharedService.showToast({
          classname: 'warning',
          text: 'Please subscribe to a plan to access this feature.',
        });
        this.router.navigate(['/subscription-plans']);
        return false;
      }),
      catchError((error) => {
        // If API call fails, redirect to subscription plans
        console.error('Error checking subscription:', error);
        this.sharedService.showToast({
          classname: 'warning',
          text: 'Please subscribe to a plan to access this feature.',
        });
        this.router.navigate(['/subscription-plans']);
        return of(false);
      })
    );
  }
}
