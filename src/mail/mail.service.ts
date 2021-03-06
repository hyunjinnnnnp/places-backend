import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}
  // TO DO : sendEmail private
  async sendEmail(
    subject: string,
    // to: string,
    template: string,
    emailVars: EmailVar[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `HJ from Places <mailgun@${this.options.domain}>`);
    form.append('to', `imhjinnnnn@gmail.com`);
    //this should be modified
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch {
      return false;
    }
  }
  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'places', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
