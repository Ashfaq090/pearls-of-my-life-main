import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionsComponent implements AfterViewInit {
  selectedAmount: number = 3;

  ngAfterViewInit() {
    this.loadPayPalScript().then(() => {
      this.renderPayPalButton();
    });
  }

  selectPlan(amount: number) {
    this.selectedAmount = amount;
    this.renderPayPalButton();
  }

  loadPayPalScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).paypal) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src =
        'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  renderPayPalButton() {
    //debugger;
    const paypal = (window as any).paypal;
    if (!paypal) return;
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';
    paypal
      .Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              { amount: { value: this.selectedAmount.toString() } },
            ],
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            alert('Payment completed by ' + details.payer.name.given_name);
            // TODO: Send payment details to backend for verification and subscription activation
          });
        },
      })
      .render('#paypal-button-container');
  }
}
