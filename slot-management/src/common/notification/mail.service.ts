import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonMailResponse } from '../types';

/**
 *  Common Mail Service
 */
@Injectable()
export class CommonMailService {
  /**
   * Mail Service Dependency
   * @param mailerService
   */
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Description - Common Email Send function
   * @param sendEmailData
   * @returns Message info
   */
  sendEmail(emailOptions: ISendMailOptions): CommonMailResponse {
    return this.mailerService.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      ...emailOptions,
    }) as CommonMailResponse;
  }
}
