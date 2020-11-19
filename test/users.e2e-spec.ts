import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import got from 'got';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

jest.mock('got');
jest.spyOn(got, 'post');

const EMAIL = 'test@email.com';
const PASSWORD = 'testpassword1!';

const createUserMutation = `mutation {
  createUser(input: {email: "${EMAIL}" password: "${PASSWORD}" role: Client}) {
    ok
    error
    data {
      email
      role
    }
  }
}`;

const loginMutation = `mutation {
  login(email: "${EMAIL}" password: "${PASSWORD}") {
    ok
    error
    token
  }
}`;

const wrongPasswordLoginMutation = `mutation {
  login(email: "${EMAIL}" password: "wrongpassword") {
    ok
    error
    token
  }
}`;

const wrongIdLoginMutation = `mutation {
  login(email: "wrong@id.com" password: "wrong@id.com") {
    ok
    error
    token
  }
}`;

const userProfileQuery = (userID: number) => `query {
  userProfile(userId: ${userID}) {
  	ok
    error
    user {
      id
      email
    }
  }
}`;

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let loginToken: string = null;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  const getServerAndQuery = (
    query: string,
    token: string = null,
  ): request.Test => {
    return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set('x-jwt', token)
      .send({ query });
  };

  describe('createUser', () => {
    it('should create user', () => {
      return getServerAndQuery(createUserMutation)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createUser.ok).toBe(true);
        });
    });
    it('should fail it user alread exist', () => {
      return getServerAndQuery(createUserMutation)
        .expect(200)
        .expect(res => {
          expect(res.body.data.createUser.ok).toBe(false);
          expect(res.body.data.createUser.error).toEqual(expect.any(String));
        });
    });
  });
  describe('login', () => {
    it('should login with correct credentials', () => {
      return getServerAndQuery(loginMutation)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;
          loginToken = login.token;
          expect(login.ok).toBe(true);
          expect(login.token).toEqual(expect.any(String));
        });
    });
    it('should not be able to login with wrong credentials', () => {
      return getServerAndQuery(wrongPasswordLoginMutation)
        .expect(200)
        .expect(res => {
          expect(res.body.data.login.ok).toBe(false);
          expect(res.body.data.login.error).toEqual(expect.any(String));
          expect(res.body.data.login.token).toBe(null);
        });
    });
    it('should fail if wrong user email pushed', () => {
      return getServerAndQuery(wrongIdLoginMutation)
        .expect(200)
        .expect(res => {
          expect(res.body.data.login.ok).toBe(false);
          expect(res.body.data.login.error).toEqual(expect.any(String));
          expect(res.body.data.login.token).toBe(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [firstUser] = await userRepository.find();
      userId = firstUser.id;
    });

    it("should see a user's profile", () => {
      return getServerAndQuery(userProfileQuery(userId), loginToken)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { userProfile },
            },
          } = res;

          expect(userProfile.ok).toBe(true);
          expect(userProfile.error).toBe(null);
          expect(userProfile.user.id).toEqual(userId);
        });
    });

    it('should not find a profile', () => {
      return getServerAndQuery(userProfileQuery(31251), loginToken)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { userProfile },
            },
          } = res;
          expect(userProfile.ok).toBe(false);
          expect(userProfile.error).toEqual(expect.any(String));
          expect(userProfile.user).toBe(null);
        });
    });
  });
  
  it.todo('verifyCode');
  it.todo('me');
  it.todo('updateProfile');
  it.todo('updatePassword');

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });
});
