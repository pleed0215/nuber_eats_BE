import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MAIL_OPTIONS } from 'src/mail/mail.constant';
import { MailService } from 'src/mail/mail.service';
import { Connection, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersModule } from './users.module';

import { UsersService } from './users.service';

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockVerificationRepository = {};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockVerificationRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: MAIL_OPTIONS,
          useValue: {
            mailgunApiKey: '',
            mailgunDomain: '',
            mailgunEmail: '',
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should fail if user exits', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'testing@email.com',
        role: 0,
      });

      const result = await service.createUser({
        email: 'testing@email.com',
        role: 0,
        password: 'testing',
        verified: false,
      });

      expect(result).toMatchObject({
        ok: false,
        error: 'The email address is arleady exist. Use another please.',
      });
    });
  });
});
