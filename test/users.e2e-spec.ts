import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import got from 'got';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

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

const meQuery = `
  query {
    me {
      email
      role
      verified
    }
  }
`;

const updateWithoutEmailMutation = (userID: number) => `
  mutation {
    updateProfile(update: { role: Delivery }) {
      ok
      error
      updated {
        role
      }
    }
  }
`;

const updateWithEmailMutation = (userID: number) => `
  mutation {
    updateProfile(update: { email: "other@email.com" }) {
      ok
      error
      updated {
        email
      }
    }
  }
`;

const updatePasswordMutation = `
  mutation {
    updatePassword(password: "changedPassword") {
      ok
      error
    }
  }
`;

const verifyCodeMutation = (code: string) => `
  mutation {
    verifyCode(code: "${code}") {
      ok
      error
    }
  }
`;

describe('UserModule Testing (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;
  let loginToken: string = null;
  let userId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
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

  describe('me', () => {
    it('should return my profile', () => {
      return getServerAndQuery(meQuery, loginToken)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { me },
            },
          } = res;

          expect(me.email).toBe(EMAIL);
        });
    });

    it('should not return any profile if not loggined', () => {
      return getServerAndQuery(meQuery)
        .expect(200)
        .expect(res => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  describe('updateProfile', () => {
    it('should success to update profile without email', async () => {
      return getServerAndQuery(updateWithoutEmailMutation(userId), loginToken)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { updateProfile },
            },
          } = res;

          expect(updateProfile.ok).toBe(true);
          expect(updateProfile.error).toBe(null);
          expect(updateProfile.updated.role).toBe('Delivery'); // 2: delivery.
        })
        .then(() => {
          return getServerAndQuery(meQuery, loginToken)
            .expect(200)
            .expect(res => {
              const {
                body: {
                  data: { me },
                },
              } = res;
              expect(me.role).toBe('Delivery');
            });
        });
    });

    it('should success to update profile with email', async () => {
      return getServerAndQuery(updateWithEmailMutation(userId), loginToken)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { updateProfile },
            },
          } = res;

          expect(updateProfile.ok).toBe(true);
          expect(updateProfile.error).toBe(null);
          expect(updateProfile.updated.email).toBe('other@email.com');
        })
        .then(() => {
          return getServerAndQuery(meQuery, loginToken)
            .expect(200)
            .expect(res => {
              const {
                body: {
                  data: { me },
                },
              } = res;
              expect(me.email).toBe('other@email.com');
            });
        });
    });

    it('should fail if user is not loggined', async () => {
      return getServerAndQuery(updateWithEmailMutation(userId))
        .expect(200)
        .expect(res => {
          const {
            body: { errors },
          } = res;

          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('updatePassword', () => {
    it('should success to change password', async () => {
      return getServerAndQuery(updatePasswordMutation, loginToken)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { updatePassword },
            },
          } = res;
          expect(updatePassword.ok).toBe(true);
          expect(updatePassword.error).toBe(null);
        });
    });

    it('should fail while changing password', async () => {
      return getServerAndQuery(updatePasswordMutation)
        .expect(200)
        .expect(res => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('verifyCode', () => {
    let user: User;
    let code: string;

    beforeAll(async () => {
      /* 
        how to get verification code for test?
        1. get a user and retrieve verification
        2. take all verification(but, for testing, there is only one verification)
      */

      user = await userRepository.findOne(userId, {
        relations: ['verification'],
      });
      code = user.verification.code;
    });

    it('should pass email verification status', async () => {
      return getServerAndQuery(verifyCodeMutation(code))
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { verifyCode },
            },
          } = res;
          expect(verifyCode.ok).toBe(true);
          expect(verifyCode.error).toBe(null);
        })
        .then(() => {
          return getServerAndQuery(meQuery, loginToken)
            .expect(200)
            .expect(res => {
              const {
                body: {
                  data: { me },
                },
              } = res;
              expect(me.verified).toBe(true);
            });
        });
    });

    it('should fail email verification', async () => {
      return getServerAndQuery(verifyCodeMutation('bullshitcode'))
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { verifyCode },
            },
          } = res;

          expect(verifyCode.ok).toBe(false);
          expect(verifyCode.error).toEqual(expect.any(String));
        });
    });
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });
});
