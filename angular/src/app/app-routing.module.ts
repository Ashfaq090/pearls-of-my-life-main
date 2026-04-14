// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { SubscriptionPlansComponent } from './features/subscriptionplan/subscriptionplan.component';
// import { LegacyComponent } from './features/legacy/legacy.component';
// import { ObituaryInfoComponent } from './features/obituary-info/obituary-info.component';
// import { DashboardComponent } from './features/dashboard/dashboard.component';

// const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'legacy',
//     pathMatch: 'full',
//   },
//   {
//     path: 'legacy',
//     component: LegacyComponent,
//     // pathMatch: 'full',
//   },
//   {
//     path: 'auth',
//     loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
//   },
//   {
//     path: 'admin',
//     loadChildren: () =>
//       import('./features/admin/admin.module').then((m) => m.AdminModule),
//   },
//   {
//     path: '',

//     loadChildren: () =>
//       import('./features/features.module').then((m) => m.FeaturesModule),
//   },

//   {
//     path: 'subscription-plans',
//     component: SubscriptionPlansComponent,
//   },
//   // {
//   //   path: 'obituary-info',
//   //   component: ObituaryInfoComponent,
//   // },
//   {
//     path: '**',
//     redirectTo: 'legacy',
//   },
// ];

// // app-routing.module.ts
// // const routes: Routes = [
// //   {
// //     path: '',
// //     redirectTo: 'legacy',
// //     pathMatch: 'full',
// //   },
// //   {
// //     path: 'legacy',
// //     component: LegacyComponent,
// //   },
// //   {
// //     path: 'auth',
// //     loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
// //   },
// //   {
// //     path: 'admin',
// //     loadChildren: () =>
// //       import('./features/admin/admin.module').then((m) => m.AdminModule),
// //   },
// //   // Remove this duplicate empty path route
// //   // {
// //   //   path: '',
// //   //   loadChildren: () => import('./features/features.module').then((m) => m.FeaturesModule),
// //   // },
// //   {
// //     path: '',
// //     loadChildren: () =>
// //       import('./features/features.module').then((m) => m.FeaturesModule),
// //   },
// //   {
// //     path: 'subscription-plans',
// //     component: SubscriptionPlansComponent,
// //   },
// //   {
// //     path: 'dashboard',
// //     component: DashboardComponent, // You'd need to import this
// //   },
// //   {
// //     path: '**',
// //     redirectTo: 'legacy',
// //   },
// // ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule],
// })
// export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionPlansComponent } from './features/subscriptionplan/subscriptionplan.component';
import { LegacyComponent } from './features/legacy/legacy.component';
import { AboutUsComponent } from './features/about-us/about-us/about-us.component';
import { PricingComponent } from './features/pricing/pricing/pricing.component';
import { OurServiceComponent } from './features/our-service/our-service/our-service.component';
import { ContactUsComponent } from './features/contact-us/contact-us/contact-us.component';
import { LegacyNavbarComponent } from './features/legacy in navbar/legacy.component';
import { AutoObituaryComponent } from './features/auto-obituary/auto-obituary.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',

    // pathMatch: 'full',
  },
  {
    path: 'home',
    component: LegacyComponent,
  },

  {
    path: 'about-us',
    component: AboutUsComponent,
    data: { animation: 'LegacyPage' },
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
    data: { animation: 'LegacyPage' },
  },
  {
    path: 'our-service',
    component: OurServiceComponent,
    data: { animation: 'LegacyPage' },
  },
  {
    path: 'pricing',
    component: PricingComponent,
    data: { animation: 'LegacyPage' },
  },
  {
    path: 'legacy',
    component: LegacyNavbarComponent,
    data: { animation: 'LegacyPage' },
  },
  // Legacy dashboard deprecated - use /videos and /audios instead
  // {
  //   path: 'legacy-dashboard',
  //   loadChildren: () => import('./legacy/legacy.module').then(m => m.LegacyModule),
  // },
  {
    path: 'obituary',
    component: AutoObituaryComponent,
    data: { animation: 'ObituaryPage' },
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/features.module').then((m) => m.FeaturesModule),
  },
  {
    path: 'subscription-plans',
    component: SubscriptionPlansComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
