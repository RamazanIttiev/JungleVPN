import { I18n } from '@grammyjs/i18n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalisationService {
  i18n = new I18n({
    defaultLocale: 'ru',
    directory: 'src/bot/localisation/i18n',
  });
}
