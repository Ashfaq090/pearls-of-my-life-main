import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Interceptor } from './services/interceptor';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { SubscriptionPlansComponent } from './features/subscriptionplan/subscriptionplan.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppComponent, SubscriptionPlansComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbToastModule,
    CommonModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
