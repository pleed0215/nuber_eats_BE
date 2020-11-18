import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { JwtService } from 'src/jwt/jwt.service';
import { MAIL_OPTIONS } from 'src/mail/mail.constant';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'token'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  // for testing UserService.
  let service: UsersService;

  // for mocking services and repositories.
  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  // testing module setting part.
  beforeEach(async () => {
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

    // get testing service.
    service = module.get<UsersService>(UsersService);

    // get mocking services and repositories.
    userRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // is service's setting ok?
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // createUser testing
  describe('createUser', () => {
    const createUserArgs = {
      email: 'testing@email.com',
      role: 0,
      password: 'testing',
    };
    const verificationArgs = {
      code: 'blahblah',
      user: createUserArgs,
    };

    it('should fail if user exits', async () => {
      userRepository.findOne.mockResolvedValueOnce(createUserArgs);

      const result = await service.createUser(createUserArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'The email address is arleady exist. Use another please.',
      });
    });

    it('should create user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);

      userRepository.save.mockResolvedValue(createUserArgs);
      userRepository.create.mockReturnValue(createUserArgs);

      verificationRepository.save.mockResolvedValue(verificationArgs);
      verificationRepository.create.mockReturnValue(verificationArgs);

      const result = await service.createUser(createUserArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createUserArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createUserArgs);

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        verificationArgs,
      );
      expect(mailService.sendVerificationEmail).toBeCalledTimes(1);
      expect(mailService.sendVerificationEmail).toBeCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true, data: createUserArgs });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error(':-('));
      const result = await service.createUser(createUserArgs);
      expect(result).toEqual({
        ok: false,
        error: 'An error occured when creating a user accound.',
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@email.com',
      password: 'test',
    };
    it('should fail if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login({ ...loginArgs });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        error: `Cannot find user email: ${loginArgs.email} in users.service.ts`,
      });
    });

    it('should success to login if the password is correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(jwtService.sign).toBeCalledTimes(1);
      expect(result).toEqual({
        ok: true,
        token: 'token',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: false,
        error: 'Your password is wrong!',
      });
    });

    it('should make error if user does not exist', async () => {
      userRepository.findOne.mockRejectedValue(
        new Error('Error from thest login failure'),
      );

      const result = await service.login(loginArgs);

      expect(result).toEqual({
        ok: false,
        error: 'Login failed. This is from login method of users.service.ts',
      });
    });
  });

  describe('findById', () => {
    const testUser = {
      id: 1,
      email: 'test@email.com',
      password: 'test',
      role: 0,
    };

    it('should success if user exist', async () => {
      userRepository.findOneOrFail.mockResolvedValue(testUser);
      const result = await service.findById(testUser.id);

      expect(result).toEqual(testUser);
    });

    it('should fail if user does not exist, and throw error', async () => {
      userRepository.findOneOrFail.mockRejectedValue(
        new Error('this error from test'),
      );
      const result = await service.findById(testUser.id);

      expect(result).toEqual(null);
    });
  });

  describe('editProfile', () => {
    const updatedInputWithEmail = {
      email: 'testchanged@email.com',
      role: 1,
    };
    const updatedInputWithoutEmail = {
      role: 1,
    };
    const willUpdateUser = {
      id: 1,
      email: 'test@email.com',
      password: 'test',
      role: 0,
    };

    it('should fail if user id does not match', async () => {
      userRepository.findOneOrFail.mockRejectedValue(
        new Error('this error is from test'),
      );
      const result = await service.updateProfile(1, updatedInputWithEmail);

      expect(result).toEqual(false);
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('case1) email not changed, should success if user exists', async () => {
      userRepository.findOneOrFail.mockResolvedValue(willUpdateUser);
      const result = await service.updateProfile(1, updatedInputWithoutEmail);

      expect(result).toEqual(true);
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('case2) email changed, should success if user exists', async () => {
      const verificationArgs = {
        code: 'testcode',
        user: willUpdateUser,
      };
      const willUpdateUserWithVerification = {
        ...willUpdateUser,
        verification: verificationArgs,
      };
      userRepository.findOneOrFail.mockResolvedValue(
        willUpdateUserWithVerification,
      );

      verificationRepository.create.mockReturnValue(verificationArgs);
      verificationRepository.save.mockResolvedValue(verificationArgs);

      const result = await service.updateProfile(1, updatedInputWithEmail);

      expect(result).toEqual(true);
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: willUpdateUserWithVerification,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        verificationArgs,
      );
    });
  });

  describe('updatePassword', () => {
    const userExist = {
      id: 1,
      email: 'test@email.com',
      password: 'test',
      role: 0,
    };
    it('should fail if user does not exist', async () => {
      userRepository.findOneOrFail.mockRejectedValue(
        new Error('This error is from test'),
      );
      const result = await service.updatePassword(1, 'testchanged');
      expect(result).toEqual(false);
      expect(userRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({ id: 1 });
    });

    it('should successif user exist', async () => {
      userRepository.findOneOrFail.mockResolvedValue(userExist);
      const result = await service.updatePassword(1, 'testchanged');

      expect(result).toEqual(true);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(userExist);
    });
  });

  describe('verifyEmail', () => {
    const userTest = {
      id: 1,
      email: 'test@email.com',
      password: 'test',
      role: 0,
    };

    const verification = {
      id: 1,
      code: 'test',
      user: userTest,
    };

    it('should fail if user does not exist', async () => {
      verificationRepository.findOneOrFail.mockRejectedValue(
        new Error('This error is from test.'),
      );
      const result = await service.verifyCode({ code: 'code' });

      expect(result).toEqual(false);
      expect(verificationRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should success if user exist', async () => {
      verificationRepository.findOneOrFail.mockResolvedValue(verification);

      const result = await service.verifyCode({ code: 'code' });
      expect(result).toEqual(true);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(verification.user);
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        verification.id,
      );
    });
  });
});
