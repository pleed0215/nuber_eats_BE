import { Test, TestingModule } from '@nestjs/testing';
import { MAIL_OPTIONS } from './mail.constant';
import { MailModuleOptions } from './mail.interfaces';
import { MailService } from './mail.service';

const mailOptions: MailModuleOptions = {
  mailgunApiKey: 'TEST_KEY',
  mailgunDomain: '@test.com',
  mailgunEmail: 'test@test.com',
};

jest.mock('got', () => ({
  response: {
    body: 'body',
  },
}));

jest.mock('form-data', () => ({
  append: jest.fn(),
}));

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

      jest
        .spyOn(service, 'sendEmail')
        .mockImplementation(async () => 'fakeBody');

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
    it('should return response.body', async () => {
      const result = await service.sendEmail('to', 'subject', 'user', {
        code: 'code',
      });

      console.log(result);
    });
  });
});
