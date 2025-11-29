import * as process from 'node:process';
import { I18n } from '@grammyjs/i18n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalisationService {
  i18n = new I18n({
    defaultLocale: process.env.DEFAULT_LOCALE || 'en',
    directory: 'src/bot/localisation/i18n',
  });
}
