import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminLoginComponent } from './pages/login/admin-login.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './pages/users/admin-users.component';
import { AdminUserDetailsComponent } from './pages/users/user-details/admin-user-details.component';
import { AdminKeyholdersComponent } from './pages/keyholders/admin-keyholders.component';
import { AdminUploadsComponent } from './pages/uploads/admin-uploads.component';
import { AdminPlansComponent } from './pages/plans/admin-plans.component';
import { AdminSubscriptionsComponent } from './pages/subscriptions/admin-subscriptions.component';
import { AdminPaymentsComponent } from './pages/payments/admin-payments.component';
import { AdminEmailLogsComponent } from './pages/email-logs/admin-email-logs.component';
import { AdminSettingsComponent } from './pages/settings/admin-settings.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminUserDetailsComponent,
    AdminKeyholdersComponent,
    AdminUploadsComponent,
    AdminPlansComponent,
    AdminSubscriptionsComponent,
    AdminPaymentsComponent,
    AdminEmailLogsComponent,
    AdminSettingsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule,
  ],
})
export class AdminModule {}

