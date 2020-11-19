import { Test, TestingModule } from '@nestjs/testing';
import { MAIL_OPTIONS } from './mail.constant';
import { MailModuleOptions } from './mail.interfaces';
import { MailService } from './mail.service';
import * as FormData from 'form-data';
import got from 'got';

const mailOptions: MailModuleOptions = {
  mailgunApiKey: 'TEST_KEY',
  mailgunDomain: '@test.com',
  mailgunEmail: 'test@test.com',
};

jest.mock('got');

jest.mock('form-data');

describe('MailService', () => {
  // for testing UserService.
  let service: MailService;

  // testing module setting part.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MAIL_OPTIONS, useValue: mailOptions },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  // is service's setting ok?
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendEmailArgs = {
        to: 'toTest',
        user: 'UserName',
        host: 'VerifyingHost',
        code: 'TestCode',
      };

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);

      service.sendVerificationEmail(
        sendEmailArgs.to,
        sendEmailArgs.user,
        sendEmailArgs.host,
        sendEmailArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        sendEmailArgs.to,
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(String),
      );
    });
  });

  describe('sendEmail', () => {
    it('should return true', async () => {
      const result = await service.sendEmail('to', 'subject', 'user', {
        code: 'code',
      });

      const formDataSpy = jest.spyOn(FormData.prototype, 'append');

      expect(formDataSpy).toHaveBeenCalled();
      expect(formDataSpy).toHaveBeenCalledTimes(5);
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
      );
      expect(result).toEqual(true);
    });

    it('should return false if got function make error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error('This is from test.');
      });
      const result = await service.sendEmail('to', 'subject', 'user', {
        code: 'code',
      });

      expect(got.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
      );
      expect(result).toEqual(false);
    });
  });
});
