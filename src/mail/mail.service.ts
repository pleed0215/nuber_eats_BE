import { Inject, Injectable } from '@nestjs/common';
import { MAIL_OPTIONS } from './mail.constant';
import { MailModuleOptions } from './mail.interfaces';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    //this.sendEmail('to', 'Eun Deok Lee', 'http://localhost:3000', 'thisIsCode');
  }

  private async sendEmail(
    to: string,
    templateName: string,
    user: string,
    data: object,
  ) {
    const form = new FormData();
    form.append('from', `Nuber-eats <pleed0215@${this.options.mailgunDomain}>`);
    form.append('to', 'pleed0215@bizmeka.com');
    form.append(
      'subject',
      `Hello ${user}, this is your verification email on Nuber-Eats!`,
    );
    form.append('template', 'verification');

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
    console.log(response.body);
  }
}
