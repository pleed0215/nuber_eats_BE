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
  ```graphql
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

3. class-validator package

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
