import { Inject, Injectable } from '@nestjs/common';
import { MAIL_OPTIONS } from './mail.constant';
import { MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(to: string, subject: string, content: string) {
    const form = new FormData();
    form.append(
      'from',
      `Very excited user <pleed0215@${this.options.mailgunDomain}>`,
    );
    form.append('to', 'pleed0215@bizmeka.com');
    form.append('subject', subject);
    form.append('text', content);

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.mailgunApiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      },
    );
  }
}
