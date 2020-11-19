import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import got from 'got';

const GRAPHQL_ENDPOINT = '/graphql';

jest.mock('got');
jest.spyOn(got, 'post');

const createUserMutation = `mutation {
  createUser(input: {email: "pleed0215@gmail.com" password: "testtest" role: Client}) {
    ok
    error
    data {
      email
      role
    }
  }
}`;

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  describe('createUser', () => {
    it('should create user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: createUserMutation,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createUser.ok).toBe(true);
        });
    });
    it('should fail it user alread exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({ query: createUserMutation })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createUser.ok).toBe(false);
          expect(res.body.data.createUser.error).toEqual(expect.any(String));
        });
    });
  });

  it.todo('userProfile');
  it.todo('verifyCode');
  it.todo('login');
  it.todo('me');
  it.todo('updateProfile');
  it.todo('updatePassword');

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });
  /*
createUser(...): CreateUserOutput!
userProfile(...): UserProfileOutput!
login(...): LoginOutput!
me: User
verifyCode(...): VerificationOutput!
updateProfile(...): UpdateProfileOutput!
updatePassword(...): LoginOutput!
*/
});
