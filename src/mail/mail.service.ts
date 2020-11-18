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
    /*this.sendEmail('to', 'Eun Deok Lee', {
      host: 'http://localhost:3000',
      code: 'this_is_code',
    });*/
  }

  async sendEmail(
    to: string,
    subject: string,
    user: string,
    emailData: Object,
    templateName = 'verification',
  ): Promise<string> {
    const form = new FormData();
    form.append('from', `Nuber-eats <pleed0215@${this.options.mailgunDomain}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', templateName);
    Object.keys(emailData).forEach(key =>
      form.append(`v:${key}`, emailData[key]),
    );

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
    return response.body;
  }

  async sendVerificationEmail(
    to: string,
    user: string,
    host: string,
    code: string,
  ): Promise<string> {
    return this.sendEmail(
      to,
      `Hello, ${user}! This is a verfication mail for Nuber-eats!`,
      user,
      { host, code },
      'verification',
    );
  }
}
