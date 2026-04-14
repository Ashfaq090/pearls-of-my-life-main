import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { AdminGuard } from '../guards/admin.guard';

const routes: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent,
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'users',
        component: AdminUsersComponent,
      },
      {
        path: 'users/:id',
        component: AdminUserDetailsComponent,
      },
      {
        path: 'keyholders',
        component: AdminKeyholdersComponent,
      },
      {
        path: 'uploads',
        component: AdminUploadsComponent,
      },
      {
        path: 'plans',
        component: AdminPlansComponent,
      },
      {
        path: 'subscriptions',
        component: AdminSubscriptionsComponent,
      },
      {
        path: 'payments',
        component: AdminPaymentsComponent,
      },
      {
        path: 'email-logs',
        component: AdminEmailLogsComponent,
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}

