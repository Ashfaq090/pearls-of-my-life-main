import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { SharedService } from './services/shared.service';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  
  title = 'pearl-of-life-user';
  public toast: BehaviorSubject<any>;
  public currentToast: any = null;
  private debugNavSub?: Subscription;
  private toastSub?: Subscription;

  constructor(
    private readonly sharedService: SharedService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ){}

  ngOnInit(): void {
    this.toast = this.sharedService.toaster;

    // Subscribe to toast changes
    this.toastSub = this.toast.subscribe((toastValue) => {
      console.log('AppComponent received toast:', toastValue);
      this.ngZone.run(() => {
        this.currentToast = toastValue;
        this.cdr.detectChanges();
      });
    });

    // DEBUG_NAV_APP_START
    this.debugNavSub = this.router.events.subscribe((event) => {
      const href = window.location.href;

      if (event instanceof NavigationStart) {
        console.log('DEBUG_NAV_APP: NavigationStart', { url: event.url, href });
      } else if (event instanceof NavigationEnd) {
        console.log('DEBUG_NAV_APP: NavigationEnd', {
          url: event.url,
          urlAfterRedirects: event.urlAfterRedirects,
          href,
        });
      } else if (event instanceof NavigationCancel) {
        console.warn('DEBUG_NAV_APP: NavigationCancel', {
          url: event.url,
          reason: (event as any).reason,
          href,
        });
      } else if (event instanceof NavigationError) {
        console.error('DEBUG_NAV_APP: NavigationError', {
          url: event.url,
          error: event.error,
          href,
        });
      }
    });
    // DEBUG_NAV_APP_END
  }

  ngOnDestroy(): void {
    this.debugNavSub?.unsubscribe();
    this.toastSub?.unsubscribe();
  }

  remove(): void {
    this.currentToast = null;
    this.sharedService.hideToast();
  }

}
