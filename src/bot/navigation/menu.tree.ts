import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuTree {
  constructor(
    private readonly mainMenu: MainMenu,
    private readonly devicesMenu: DevicesMenu,
    private readonly paymentMenu: PaymentMenu,
    private readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
    private readonly paymentMethodsMenu: PaymentMethodMenu,
    private readonly subscriptionMenu: SubscriptionMenu,
  ) {}

  init(): Menu {
    const main = this.mainMenu.menu;
    const subscriptionMenu = this.subscriptionMenu.menu;
    const devices = this.devicesMenu.menu;
    const paymentMenu = this.paymentMenu.menu;
    const paymentsPeriodsMenu = this.paymentsPeriodsMenu.menu;
    const paymentMethodsMenu = this.paymentMethodsMenu.menu;

    main.register(devices);
    main.register(paymentMenu);
    main.register(paymentsPeriodsMenu);
    main.register(subscriptionMenu);
    main.register(paymentMethodsMenu);

    return main;
  }
}
