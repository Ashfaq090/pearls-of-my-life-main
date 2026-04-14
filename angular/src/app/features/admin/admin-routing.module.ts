import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  // {
  //   path: '',
  //   component: AdminDashboardComponent,
  //   children: [
  //     {
  //       path: '',
  //       redirectTo: 'users',
  //       pathMatch: 'full',
  //     },
  //     {
  //       path: 'users',
  //       component: UserManagementComponent,
  //     },
  //   ],
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
