import { Menu } from '@bot/navigation/core/menu';
import { DevicesMenu } from '@bot/navigation/core/menu/features/devices.menu';
import { MainMenu } from '@bot/navigation/core/menu/features/main/main.menu';
import { MainNewUserMenu } from '@bot/navigation/core/menu/features/mainNewUser.menu';
import { PaymentMenu } from '@bot/navigation/core/menu/features/payment.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/core/menu/features/payment-periods.menu';
import { SubscriptionMenu } from '@bot/navigation/core/menu/features/subscription.menu';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuTree {
  constructor(
    private readonly mainMenu: MainMenu,
    private readonly mainNewUserMenu: MainNewUserMenu,
    private readonly devicesMenu: DevicesMenu,
    private readonly paymentMenu: PaymentMenu,
    private readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
    private readonly subscriptionMenu: SubscriptionMenu,
  ) {}

  init(): Menu {
    const main = this.mainMenu.menu;
    const mainNewUserMenu = this.mainNewUserMenu.menu;
    const subscriptionMenu = this.subscriptionMenu.menu;
    const devices = this.devicesMenu.menu;
    const paymentMenu = this.paymentMenu.menu;
    const paymentsPeriodsMenu = this.paymentsPeriodsMenu.menu;

    main.register(devices);
    main.register(paymentMenu);
    main.register(paymentsPeriodsMenu);
    main.register(subscriptionMenu);
    main.register(mainNewUserMenu);

    return main;
  }
}
