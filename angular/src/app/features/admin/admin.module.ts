import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from '../../shared/header/header.component';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';

@NgModule({
  declarations: [AdminDashboardComponent], // UserManagementComponent moved to FeaturesModule
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    HeaderComponent,
    SideNavComponent,
  ],
  exports: [UserManagementComponent],
})
export class AdminModule {}
