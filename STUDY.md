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
   @Resolver()
   export class RestaurantsResolver {
     @Query(() => Boolean)
     isPizzaGood(): Boolean {
       return true;
     }
   }
   ```

- module 파일에

  ```js
  @Module({
  imports: [
      GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      }),
  ```

  - 이렇게 추가해주면 자동으로 shcema파일을 만들어준다.

    - resolver 파일의 Boolean 타입은 graphql type이다.
