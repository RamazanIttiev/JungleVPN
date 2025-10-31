import { Menu } from '@bot/navigation/core/menu';
import { DevicesMenu } from '@bot/navigation/devices.menu';
import { MainMenu } from '@bot/navigation/main.menu';
import { PaymentMenu } from '@bot/navigation/payment.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/payment-periods.menu';
import { SubscriptionMenu } from '@bot/navigation/subscription.menu';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuTree {
  constructor(
    private readonly mainMenu: MainMenu,
    private readonly devicesMenu: DevicesMenu,
    private readonly paymentMenu: PaymentMenu,
    private readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
    private readonly subscriptionMenu: SubscriptionMenu,
  ) {}

  init(): Menu {
    const main = this.mainMenu.create();
    const subscriptionMenu = this.subscriptionMenu.create();
    const devices = this.devicesMenu.create();
    const paymentMenu = this.paymentMenu.create();
    const paymentsPeriodsMenu = this.paymentsPeriodsMenu.create(paymentMenu);

    main.register(devices);
    main.register(paymentMenu);
    main.register(paymentsPeriodsMenu);
    main.register(subscriptionMenu);

    return main;
  }
}
