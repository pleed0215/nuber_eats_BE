## 0 INTRODUCTION

1. .gitignore extension
2. GraqphQL과 nest js를 같이?
   - 둘다 api framework 아니었나 싶긴한데..
   - after 100% udnerstanding graphql and database on nestjs, and we'll go on.
   - 왜냐하면 clone part가 엄청 빠를 것이기 때문.

## 1. Graphql API

- nestjs에서 graphql 이 어떻게 돌아가는 지 알려주기 위해 사용한다고 한다.

### 1.0 apollo server setup

- nestjs homepage에서 graphql quickstart 코너를 보면, install 할 패키지를 나타내준다.

1. graphql resolver on nestjs
   - resolver를 아래와 같이 만들어주고...
   ```js
   @Resolver(of => Restaurant)
   export class RestaurantsResolver {
     @Query(returns => [Restaurant])
     restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
       return [];
     }
   }
   ```

- 이런 것은 그냥 익혀놔야 함. 왜냐하면 프레임워크이니까..
- 이렇게 해 놓으면 schema.gql을 자동으로 만들어준다.

2. InputType 활용.

```js
@Mutation(returns => Boolean)
  createRestaurant(
    @Args('name') name: string,
    @Args('isVegan') isVegan: boolean,
    @Args('address') address: string,
    @Args('ownerName') ownerName: string,
  ): boolean {
    return true;
  }
```

```js
@InputType()
export class CreateRestaurantDto {
  @Field(type => String) name: string;
  @Field(type => Boolean) isVegan: boolean;
  @Field(type => String) address: string;
  @Field(type => String) ownerName: string;
}
```

- InputType을 이렇게 넘길 수도 있다.

- @Args를 이렇게 반복하는 대신에..InputType을 활용해도 된다.
- 일종의 Dto를 만들어서,
- @InputType과 @ArgsType
  - 강의에서 입력하기 힘들다 하면서 갑자기 바꿈.
  - 그도 그럴만한게..
  ```gql
    mutation {
      createRestaurant(createRestaurantInput: {
        name: ""
        isVegan: false
        ...
      })
    }
  ```
- 사용방법이 각각 좀 다르다.
- @InputType을 이용할 때에는 object로 넘겨줘야하기 때문에
  - resolver에서도
  ```js
    createRestaurant(
    @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantDto,
  ): boolean
  ```
  - 이런 식으로 사용해줘야 하는 반면에..
  - @ArgsType을 사용하면
  ```js
  createRestaurant(
    @Args() createRestaurantInput: CreateRestaurantDto,
  ):
  ```
  - 이렇게 바꿔서 써 줄 수 있다.
  - endpoint에서 사용 방법 역시 다른데,
  - @InputType 같은 경우는 위에서 언급했고,
  - @ArgsType 같은 경우는 그냥 argument사용하듯이 넘겨주면 된다.
  - @ArgsType은 윗 부분에 Args 여러개 사용한 부분과 같은 역할을 하는 것.

* module 파일에

  ```js
  @Module({
  imports: [
      GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      }),
  ```

  - 이렇게 추가해주면 자동으로 shcema파일을 만들어준다.

    - resolver 파일의 Boolean 타입은 graphql type이다.

1. class-validator package

- npm i calss-validator class-transformer
-

## 2 TypeORM

1. installation

```sh
  npm install typeorm --save
  npm install reflect-metadata --save
  npm install @types/node --save-dev
  npm install mysql --save
  npm install pg --save
  npm install @nestjs/typeorm
```

and import it somewhere in the global place of your app (for example in app.ts)
import "reflect-metadata";

- @nestjs에서 typeorm 세팅하는 것은 @neestjs/typeorm 검색해서 확인.
- db confinguration에서 db password 등을 저장하는 것은 당연히 dotenv 쓸 것이라 생각을 했지만..
- @nestjs/config를 이용해서 ConfigModule로 이용하지만, 이것도 사실은 dotenv를 사용하는 것.

2. joi

- 패키지를 또 설치한다... 너무 많엉.
- The most powerful schema description language and data validator for JS.
- 라고 한다.
- 엄청 중요한 패키지인듯..

```js
validationSchema: Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'prod'),
  POSTGRES_PASSWORD: Joi.string().required(),
});
```

- 간단하게 예제로 만들어 준 것 같은데, string이 dev or prod인지 검증한다.
- 검증한다고 패키지를 인스톨하진 않았을 것 같다.

## 3 TYPEORM and nest

1. typeorm & graphql

- 여기서 이런 큰 그림이 있는 줄 몰랐다.
- restaurant.entity.ts에 정의한 클래스는 graphql의 schema를 자동으로 만들어주는 것이라고만 생각했는데,
- typeorm db의 schema도 같이 만들어 질 수 있는 것.
- 근데 relation은 어떻게??

- module의 TypeOrm 세팅에서, entities에 만들어준 엔티티를 넣어주자.
- synchronize option을 true로 해놓으면, entity에 해당하는 database schema를 자동으로 업데이트 해준다.

- error

  - entities 경로에 'src/\*_/_.entity{.ts,.js}' 이렇게 집어 넣었떠니.
  - Cannot use import statement outside a module에러가 나왔는데,
  - 구글링 결과 경로 문제인 듯.. 해서..
  - entities: [join(__dirname, '**', '*.entity.{ts,js}`)]
  - 이렇게 바꿔주라 한다.
  - module setting의 forRoot를 이용할 때는 위와 같은 방법을 사용하고,
  - ormconfig.json을 사용하는 경우는..
  - entities: 'src/\*_/_.entity{.ts,.js}'
  - 이런식으로 사용하면 된다고 한다.

  - .env와 ormconfig.json 을 같이 혼용하고 싶었는데 안 된다.
    - password 문제만 아니면 ormconfig.json을 사용할 수 있는데..
    - password 때문에 따로 forRoot에서 설정해줬는데, 둘 중 하나만 사용이 가능한가보다.
  - 잘 작동이 안되어서 강의대로 Class name을 넣었다.

2. Active Record vs Data mapper?

### 1. Active Record

- Entity는 BaseEntity라는 클래스를 상속 받아서 정의해야 한다.

```js
 @ObjectType()
 @Entity()
 export class Restaurant extends BaseEntity {
   ...
 }
```

- custom method를 정의하고 싶다면, static으로 메소드를 만들어줘야 한다.

```js
static findByName(firstName: string, lastName: string) {
       return this.createQueryBuilder("user")
           .where("user.firstName = :firstName", { firstName })
           .andWhere("user.lastName = :lastName", { lastName })
           .getMany();
   }

```

### 2. Data mapper

- Data mapper는 위에서 BaseEntity를 상속받지 아니하고 그냥 사용이 가능하다.
- Activie Record 같은 경우 find, create, save method를 이용하고 싶다면.
- Entity 클래스 method를 사용해야 한다.

```js
   // example from typeorm documentaiton
   const user = new User();
   user.firstName = "";
   await user.save();
   await user.remove();

   const newUsers = await user.find({...some condition})

```

- 반면에 data mapper에서는 repository라는 것을 이용해야 ㅎ한다.

```js
  const userRepository = connection.getRepository(User);
  const newUser = new User();
  user.firstName = "";
  // Active record와 차이
  await userRepository.save(user);
  await userRepository.remove(user);

  const foundUser = await userRepository.find({...some condition});
```

- 사용법에는 차이가 있지만, 장단점이 있으므로 사용자가 알아서 하면 된다라는 것..
- custom method를 추가하는 것도 ActiveRecord와 다르다.

```js
// Active record의 custom method 만드는 방법.
  export class User extends BaseEntity {
    ...
    static findByName(firstName: string, lastName: string) {
      return this.createQueryBuilder("user").
      where("user.firstName = :firstName", {firstName}).
      andWhere("user.lastName = :lastName", {lastName}).
      getMany();
    }
  }
// Data mapper의 custom method 만드는 방법.
export class UserRepository extends Repository<User> {
  findByName (firstName: string, lastName: string) {
    static findByName(firstName: string, lastName: string) {
      return this.createQueryBuilder("user").
      where("user.firstName = :firstName", {firstName}).
      andWhere("user.lastName = :lastName", {lastName}).
      getMany();
    }
  }
}
```

- 이렇듯 방법이 서로 다름.
- nestjs 에서는 data mapper를 사용한다고 한다.

## 2. Injection the repository

- 먼저 모듈에서 TypeOrmModule를 로드해야 한다.
- RestaurantsService도 연결해줘야 한다.

```js
@Module({
  // 추가.
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantsResolver, RestaurantsService],
})
```

- 정리
  restaurant module

  - service -> database에 접근 -> database data 넘겨줌 -> resolver -> graphql resolver

- data mapper를 추천한 이유는 nestjs 의 service를 이용함에 있어서
  - @InjectRepository()를 이용할 수 있기 때문에.. 더 간편해서.
  - 정리하자면 typeorm과 nestjs를 연결하기 위해서는
  1. module에서 typeorm module 연결
  2. service에서 repository (InjectRepository)가져오기.

## 3. Mapped Types

- Partial, pick, omit, intersection, composition
- 삽질 기록

  - dto에서 type이 arg타입인지 input 타입인지 확인하고

    - @Args() 생략하는 것 -> ArgsType
    - @Args('name') 적는 것 -> InputType

  - validation은 object type에서 해도 되므로 entity로 옮기면 된다.

- IsOptional()

- UpdatedRestaurantDto에서 PartialType으로 CreateRestaurantDto를 상속 받아서 사용하였는데

  - id가 필요하므로, Restaurant를 PartialType으로 해도 되지 않을까??
  - 그런데 id는 필수이지 optional이 아니므로, id 필드를 추가해주는 방향으로 한 것.

- update는 criteria의 유효성을 검증하지 않으므로, 이를테면 다른 id를 넣어줘도 ok로 update를 해버린다.

* enum type을 등록하려면 -> graphql & typeorm 에 등록해야 한다.
  - typeorm에 등록하는 방법
    - @Column({type: 'enum', enum: UserRole})
  - graphql에 등록
    - registerEnumType(UserRole, {name: "UserRole"})

## 4. Entity Listener

- decorator를 이용하여 event listener를 만든다.
- AfterLoad, AfterInsert, BeforeInsert, BeforeUpdate, AfterUpdate, BeforeRemove, AfterRemove,

  ```js
  @Entity()
  export class Post {
    @AfterLoad()
    updateCountries() {
      if (this.likesCount === undefined) this.likesCount = 0;
    }
  }
  ```

  ## 5. node.bcrypt.js

  - hash password package
  - bcrypt. hash. compare만 알면 된다.

# 5 User Authentication

- jsonwebtoken install
- google에 secret key generator를 이용해서 secretkey를 만든 후 env에 때려 넣자.

## ConfigService

- @Module에 TypeOrmModule 사용한 것처럼, ConfigService를 import해서 사용.

  - import: [ConfigService]
  - service.ts -> private readonly config: ConfigService를 추가한다.
  - 그냥 nestjs way라고 생각하면 될 것같다. 사실 process.env.SECRET_KEY 써도 상관 없다.
  - 이렇게 하면 this.config.get('SECRET_KEY');라 해야 한다.

- jwt token 넘겨줄 때에는 password를 넘겨주진 말자.

## JwtModule & Making Global Module

- passport 대신 jwtmodule을 만들어보자.

```js
@Module({
  providers: [JwtService],
})
@Global()
export class JwtModule {
  static forRoot(): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: 'OPTIONS',
          useValue: options,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
```

- custom value를 전달할 수 있는데 위와 같은 방법으로 해주면 된다.
- providers: [ JwtService ]는 원래

  ```js
  providers: [{ provide: JwtService, useClass: JwtService }];
  ```

  의 줄임 형태

- @Global을 줘야 global로 사용 가능.

```js
@Injectable()
export class JwtService {
  constructor(@Inject('OPTIONS') private readonly options: JwtModuleOptions) {
    console.log(options);
  }
  hello() {
    console.log('hello');
  }
}
```

- service에서 강의 내용과는 다르게 'OPTIONS'를 exports해야 작동을 한다.

## middleware in nestjs

- jwt token을 어떻게 넘겨줘야 하나?
- REST API 때 처럼 header로 정보를 넘겨주면 된다.
- header의 정보를 어떻게 받나?

  - 여기서 필요한게 middleware인 듯.
  - express의 미들웨어와 개념이 비슷하다.

### 1. class middleware

```js
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(req.headers);
    next();
  }
}
```

- implements는 extends와는 달리 interface를 상속 받기 때문에, 구현부가 하나도 없다고 생각하면 된다.
- Request, Response, NextFunction은 모두 express에서 import해야 한다.
- 결론은, express의 middleware와 같다. 그래서 next()까지 호출해주는 것.
- 나머지 단계는 그럼 middleware를 어떻게 install 할 것인가..? - express같은 경우는 app.use(~~)하면 되었지만..

### 2. middleware install - 1

        ```js
        export class AppModule implements NestModule {
          configure(consumer: MiddlewareConsumer) {
            consumer
              .apply(JwtMiddleware)
              .forRoutes({ path: '/graphql', method: RequestMethod.POST });
          }
        }
        ```

        - nestjs의 경우 어떤 앱애도 설치할 수 있다고 한다.
        - forRoutes말고 exclude method도 있다.
        - class 말고 function 형태로도 middleware를 만들 수가 있다.

### 3. functional middleware

        ```js
          export function jwtMiddleware (req: Request, res: Response, next: NextFunction) {
            console.log(req.headers);
            next();
        }
        ```
        - 물론 AppModule에서도 apply 부분을 수정해줘야 한다.

### 4. middleware install -2

- main.ts에서 express way로 middleware install도 가능하다.

  ```js
  // main.ts
  async function bootstrap() {
    ...
    app.use(jwtMiddleware);
    ...
  }

  ```

  - class 형태로는 안되고 functional 만 가능.
  -

### 5. headers check

```js
if ('x-jwt' in req.headers) {
  console.log(req.headers['x-jwt']);
}
```

- js에 in이 있는지 몰랐당..;;

### 6. decode jwt

- jwt.decode or verify method
- JwtService에 verfiy method를 추가하고, middleware에서 사용하려고 하는데,
- import를 해야 할 것인데 어떤 방법으로..?
- 정답은 @Injectable을 이용하면 된다.

```js
@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}
    ...
```

- 이렇게 하면 JwtService를 사용할 수 있다.
  !! 이해가 안되는 부분

```js
const token = req.headers['x-jwt'];
console.log(typeof token);
const decoded = this.jwtService.verify(token.toString());
```

- 왜 이렇게 써야 할까.. typescript에서 에러를 내뿜는다. token이 string[]이라구하면서..
- req['user'] = user 넘기는 부분까지는 별로 문제가 없다.

### 7. Graphql context

- apollo server에서 사용하는 context 개념이라는데..
- A request context is avaiable for each request.
- context is defined as a function and it will be called on each request and will received an object containing a req property, which is request.
- apollo-server에 관련된 내용이기 때문에 GraphQLModule에서 설정 들어가야 하기 땜에, AppModule로 이동해서 설정해준다.
  ```js
  // app.module.ts
  @Module ({
    ...
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ user: req['user'] }),
    }),
    ...
  })
  ```
- 이렇게 해줘야 하는 이유는 nestjs와 graphql의 연결 때문인 것으로 생각할 수 있다.

```js
  @Query(returns => User)
  me(@Context() context): User {
    return context['user'];
  }
```

- 그러면 이렇게 연결해서 사용해 줄 수 있다.
- 로그인 단계를 정리하자면
  1. trying login
  2. if login is success get a token -> JwtService.sign
  3. using token, put it in request.header -> 이건 아마도 client에서 graphql에 request를 할 때 header에 받은 token정보를 넘겨줄 것이다.
  4. if token exist, get a user information -> in jwt.middleware -> req['user']=user;
  5. and graphql context also take the user information too.
  6. now graphql can use user information and authentication is done.

### 7. Auth module, Auth Guard

여기까지 따라오는 것도 쉽지 않았는데(새로운 내용이 많으면 항상 어려운 법), 갑자기 지금 사용방법이 섹시하지 않다면서 다른 내용을 설명해준다.

#### UseGuards

- 내 생각에는 위의 내용과 여기 내용은 다르다.
- 토큰 얻어오는 부분과 얻은 토큰으로 Authorization 한다는 것이므로 엄연히 다른 부분이다.
- UseGuards는 AuthGuard라는 클래스를 만듬으로써, Authentication을 관리하는 것.

```js
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {}
}
```

- 이건 딱히 Auth에만 사용할 수 있는 것은 아닌 것 같다.
- canActiate가 참/거짓이냐에 따라 결과 행동이 달라진다.
- 어디서 사용할 수 있냐하면.
- 그 user.resolve.ts의 me query에 보면

```js
 @Query(returns => User, { nullable: true })
 @UseGuards(AuthGuard)
 me(@Context() context): User {
   return context['user'];
 }
```

- 이렇게 추가해서 사용할 수 있다.
- **@UseGuards**의 결과값에 따라 'forbidden resource' 에러 메시지를 내보내면서 작동 여부를 선택할 수 있는 것.

<code js>const gqlContedt = GqlExecutionContext.create(context).getContext(); </code>

- 나는 솔직히 nestjs나 graphql의 사용 잇점을 아직 잘 모르겠다. 복잡만 해지는 것 같구..
- 사람들이 다 사용하는 데에는 이유가 있을 것..

- 강의 중에 UserGuard decorator를 계속 사용하는 건 보어링 하다면서..

### 8. Custom decorator for AuthUser

```js
export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);
```

이렇게 만들고,

```js
@Query(returns => User, { nullable: true })
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser:User): User {
    return authUser;
  }
```

- 이렇게 사용해주면 된다고 한다.
-

### 9. save method & update method

- password hashing을 위해 entity에서 @BeforeUpdate를 사용해야 하는데..
- entity의 update 메소드를 사용하면 @BeforeUpdate를 호출 하지 않는다.
- save method를 보면 entity가 없으면 record를 만들고 없다면 update를 한다.

- update profile과 update password를 분리할까?? 하는 고민이 생긴다.
- 나는 분리했다.

## 6 Email verification

### 1. One-to-One Relationship

- @OneToOne
- @JoinColumn
  JoinColumn은 한 쪽에만..두 쪽에 다 있으면 안되고,

  - 예시 코드, [출처](https://orkhan.gitbook.io/typeorm/docs/one-to-one-relations)

  ```js
  import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
  import { User } from './User';

  @Entity()
  export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    gender: string;

    @Column()
    photo: string;

    @OneToOne(
      type => User,
      user => user.profile,
    ) // specify inverse side as a second parameter
    user: User;
  }
  ```

  - JoinColumn은 두쪽에 다 있을 필요가 없다.

  ```js
  import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { Profile } from './Profile';

  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToOne(
      type => Profile,
      profile => profile.user,
    ) // specify inverse side as a second parameter
    @JoinColumn()
    profile: Profile;
  }
  ```

### 2. verification

- user create를 했을 때 verification을 만든다.
- profile에서 email을 업데이트했을 경우 verification을 새로 만들어야 하는데
  - 기존의 verification은 삭제해야 한다. one-to-one relationship이기 때문에..
- Resolver

  - verification은 매우 작기 때문에 user에서 resolver도 처리한다.

- relation id with entity

  1. findOne에 options을 주지 않았을 때.

  ```js
  const verification = await this.verification.findOne({ code });
  console.log(verification, verification.user);
  ```

  - 결과값

  ```js
    Verification {
    id: 1,
    createAt: 2020-11-12T14:31:48.556Z,
    updatedAt: 2020-11-12T14:31:48.556Z,
    code: '8462d3ed2b32-4368-97fb-ec40a5a5525f'
  } undefined
  ```

  - 위에서 관계 설정한 것으로 profile.user, user.profile이 성립할 줄 알았는데,, undefined로 된다.
  - 심지어는 userId값도 주어지지 않는다..

  2. findOne에 loadRelationIds: true 옵션값을 줬을 때.

  ```js
  const verification = await this.verifications.findOne(
    { code },
    { loadRelationIds: true },
  );
  ```

  - 이렇게 하면 relationId를 얻어오고 data 자체를 얻어 오는게 아니다.
  - 결과값

  ```js
  Verification {
  id: 1,
  createAt: 2020-11-12T14:31:48.556Z,
  updatedAt: 2020-11-12T14:31:48.556Z,
  code: '8462d3ed2b32-4368-97fb-ec40a5a5525f',
  user: 8
  } 8
  ```

  3. findOne에 relations: ['user'] 옵션값을 줬을 때.

  ```js
  const verification = await this.verifications.findOne(
    { code },
    { relations: ['user'] },
  );
  ```

  - 결과값

  ```js
    id: 1,
    Verification {
    createAt: 2020-11-12T14:31:48.556Z,
    updatedAt: 2020-11-12T14:31:48.556Z,
    code: '8462d3ed2b32-4368-97fb-ec40a5a5525f',
    user: User {
      id: 8,
      createAt: 2020-11-12T14:31:48.429Z,
      updatedAt: 2020-11-12T14:31:48.429Z,
      email: 'pleed@nomad.com',
      password: '$2b$10$zUoBTJqBGse6SdC1iGOR2OK2k1/qwMlfaK.sYq5rJxSglDUptKlwi',
      role: 0,
      verified: false
    }
  } User {
    id: 8,
    createAt: 2020-11-12T14:31:48.429Z,
    updatedAt: 2020-11-12T14:31:48.429Z,
    email: 'pleed@nomad.com',
    password: '$2b$10$zUoBTJqBGse6SdC1iGOR2OK2k1/qwMlfaK.sYq5rJxSglDUptKlwi',
    role: 0,
    verified: false
  }
  ```

  - 이렇게 해야 user data에 접근이 가능하다.
  - 갑자기 django가 위대해보인다..정말 쉽고 생산성이 높은 프레임워크인 것 같다.

### 3. OnetoOne cascade deleting

```js
@OneToOne(
    type => Verification,
    verification => verification.user,
    { cascade: true },
  )
  verification: Verification;
```

- 한쪽 이렇게 설정해주고,

```js
@OneToOne(
    type => User,
    user => user.verification,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  user: User;
```

- 나머지도 이렇게 설정. cascade: true 옵션을 준다. @JoinColumn이 없는 쪽,
- 'CASCADE' 옵션은 지움을 당하는 쪽에 설정을 해준다. @JoinColumn이 있는 쪽,
- cascade: true는 지우는 쪽에 설정을 해준다. 라고 이해하면 될 듯하다.

### 4. 꼭 중요한 건 늦게 알려주더라.

- password가 console이든 어디든 안나오게 하려면, @Column({select: false})
- 이렇게 하면 중요한 점이 그냥 query나 find하면 password가 나오지 않기 때문에..
- select: ['password']로 다시 나오게 해야하는 과정이 필요하다.
- 이를테면 select:false한 상태로 login하면 제대로 작동하지 않는다.
- 왜냐하면 checkPassowrd가 this.password를 사용하기 때문에.. 그래서 select: ['password'] 옵션을 주고 로그인 해야 하는 과정이 필요하다.
- (추가) => 'id'도 같이 select 해줘야 한다...

### 5. 발견한 문제

- updateProfile하고 나서 정보를 전달해주면, 수정 전의 정보가 그대로 있다.
- 이건 아마도 request의 user정보가 수정이 안되었기 때문인 것 같은데.. 어찌..?

### 6. Email moduler

- email 관려해서는 nestjs module이 따로 있다. [링크](https://github.com/nest-modules/mailer)

  - pug 엔진 사용해서 템플릿을 이용해서 이메일을 보낼 수 있는 모양인데
  - 여기서는 공부를 위해서 사용 안하겠다고 한다.
  -

#### sending email

```sh
curl -s --user 'api:YOUR_API_KEY' \
	https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
	-F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
	-F to=YOU@YOUR_DOMAIN_NAME \
	-F to=bar@example.com \
	-F subject='Hello' \
	-F text='Testing some Mailgun awesomeness!'
```

- curl을 이용할 수는 없고, request 등의 라이브러리를 이용하여 fetching을 해야 한다.
- request를 이용해서 fetching 하려고 했는데, depreacted가 되어서 GOT 패키지를 쓴다고 한다.

  - <code>npm i got</code>

  - `--user 'api:YOUR_API_KEY'`

    - 이부분을 보낼 때 header로 정보를 보내줘야 하는데, 이건 일종의 규칙이기 때문에 그냥 알아두자.

    ```js
      headers: {
        Authorization: `Basic ${Buffer.from(
          `api:${this.options.mailgunApiKey}`,
        ).toString('base64')}`,
      },
    ```

  - `F from=~~~`
    - 이 부분의 F는 form data 라는 패키지를 이용해야 한다.
    - 하.. 패키지 겁나 많다. 진짜.
    - <code> npm install form-data</code>
    ```js
    const form = new FormData();
    form.append(
      'from',
      `Very excited user <pleed0215@${this.options.mailgunDomain}>`,
    );
    form.append('to', 'pleed0215@bizmeka.com');
    form.append('subject', subject);
    form.append('text', content);
    ```
    - -F 관련된 것은 이렇게 form data로 만들어준다.
  - method는 POST로해서..

  ```js
  const response = await got(
    `https://api.mailgun.net/v3/${this.options.mailgunDomain}/messages/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `api:${this.options.mailgunApiKey}`,
        ).toString('base64')}`,
      },
      body: form,
    },
  );
  ```

  - 결과적으로 이렇게 보내면 OK.
  - **_caution_**
    - url을 https://api.mailgun.net/v3/${this.options.mailgunDomain}/messages/ 이렇게 보내면 안된다.
    - endpoint관련 문제 때문에.. 끝에 '/'를 빼줘야 한다.

# Testing

## 1. user service unit test

- testing 위한 셋팅을 해야 한다고..
- UsersService에서 import한 service들, MailService, JwtService, UserRepository.. 등 loading failture가 발생하는데..

### mocking

- 위 에러를 해결하기 위해서 실제로 위 서비스들을 loading 하는 것이 아니라, 흉내내는 역할을 하는 것을 사용해야 한다.

```js
const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};
const module: TestingModule = await Test.createTestingModule({
  providers: [
    MailService,
    /* 이것처럼 만들어주면 된다. 그럼 repository를 mocking 한다 */
    {
      provide: getRepositoryToken(User),
      useValue: mockUserRepository,
    },
  ],
}).compile();
```

### mocking repository

```js
  let userRepository:Partial<Record<keyof Repository<User>, jest.Mock>>;
```

- mockResolvedValue

  - users.service.ts의 createUser에서

  ```js
  const exist = await this.users.findOne({ email });
  ```

  이러한 코드가 있는데, 이를 mocking 하려면..
  test에서 mocking한 repository에

  ```js
    userRepository.findOne.mockResolvedValue({ ...})
  ```

  를 해주면 된다.

  - 이렇게 해주면 findOne은 위에서 설정해준 값을 리턴해준다.

### coveragePathIgnorePatterns

```js
    "coveragePathIgnorePatterns": [
      "node_modules",
      ".entity.ts",
      ".constant.ts"
    ]
```

- json 자리에 이거 추가 해주면 coveragePath에서 빠진다.
-
