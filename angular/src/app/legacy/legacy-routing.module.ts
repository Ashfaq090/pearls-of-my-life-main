import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LegacyDashboardComponent } from './components/legacy-dashboard/legacy-dashboard.component';

const routes: Routes = [
  { path: '', component: LegacyDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegacyRoutingModule { }
