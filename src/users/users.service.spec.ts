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

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

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
  let verificationRepository: MockRepository<Verification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
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
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserArgs = {
      email: 'testing@email.com',
      role: 0,
      password: 'testing',
    };
    it('should fail if user exits', async () => {
      userRepository.findOne.mockResolvedValueOnce(createUserArgs);
      userRepository.create.mockReturnValue(createUserArgs);
      userRepository.save.mockResolvedValue(createUserArgs);

      verificationRepository.save.mockResolvedValue({ user: createUserArgs });
      verificationRepository.create.mockReturnValue({ user: createUserArgs });

      const result = await service.createUser(createUserArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'The email address is arleady exist. Use another please.',
      });
    });

    it('should create user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      await service.createUser(createUserArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createUserArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createUserArgs);

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createUserArgs,
      });
    });
  });
});
