import { Test, TestingModule } from '@nestjs/testing';
import { JWT_OPTIONS } from './jwt.constant';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

import * as jwt from 'jsonwebtoken';

const TEST_SECRET = 'theSecret';
const ID = 1;

const jwtOptions: JwtModuleOptions = {
  secretKey: TEST_SECRET,
};

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'token'),
  verify: jest.fn(() => ({ id: ID })),
}));

describe('JwtService', () => {
  // for testing UserService.
  let service: JwtService;

  // testing module setting part.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService, { provide: JWT_OPTIONS, useValue: jwtOptions }],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  // is service's setting ok?
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return an signed token', () => {
      const token = service.sign(ID);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: ID }, TEST_SECRET);
      expect(token).toEqual('token');
      expect(typeof token).toEqual('string');
    });
  });

  describe('verify', () => {
    it('should return decoded token', () => {
      const TOKEN = 'ANYTOKEN_BECUASE_IT_IS_UNIT_TEST';
      const decoded = service.verify(TOKEN);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_SECRET);
      expect(decoded).toEqual({ id: ID });
    });
  });
});
