import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-subscriptions',
  templateUrl: './admin-subscriptions.component.html',
  styleUrls: ['./admin-subscriptions.component.scss'],
})
export class AdminSubscriptionsComponent implements OnInit {
  subscriptions: any[] = [];
  plans: any[] = [];
  loading: boolean = false;
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;
  selectedSubscription: any = null;
  newPlanId: string = '';

  constructor(private adminApi: AdminApiService) {}

  ngOnInit() {
    this.loadSubscriptions();
    this.loadPlans();
  }

  loadSubscriptions() {
    this.loading = true;
    this.adminApi.getSubscriptions(this.page, this.limit).subscribe({
      next: (response) => {
        this.subscriptions = response.subscriptions || [];
        this.total = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subscriptions:', error);
        this.loading = false;
      },
    });
  }

  loadPlans() {
    this.adminApi.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
      },
    });
  }

  cancelSubscription(id: string) {
    if (confirm('Cancel this subscription?')) {
      this.adminApi.cancelSubscription(id).subscribe({
        next: () => this.loadSubscriptions(),
        error: (error) => alert('Error: ' + (error.error?.message || 'Failed to cancel')),
      });
    }
  }

  openChangePlanModal(subscription: any) {
    this.selectedSubscription = subscription;
    this.newPlanId = subscription.planId;
  }

  changePlan() {
    if (this.selectedSubscription && this.newPlanId) {
      this.adminApi
        .changePlan(this.selectedSubscription.id, this.newPlanId)
        .subscribe({
          next: () => {
            this.loadSubscriptions();
            this.selectedSubscription = null;
            this.newPlanId = '';
          },
          error: (error) => alert('Error: ' + (error.error?.message || 'Failed to change plan')),
        });
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadSubscriptions();
    }
  }
}

