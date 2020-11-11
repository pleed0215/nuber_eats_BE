import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import * as Joi from 'joi';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';

console.log(process.env.NODE_ENV);
console.log(
  join(
    __dirname,
    process.env.NODE_ENV === 'prod' ? 'dist' : 'src',
    '**',
    '*.entity.{ts,.js}',
  ),
);
// secret key: FHaITMZg4S6Y8aooKl1O1YPTSIxDW5Vz

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.dev.env' : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod')
          .default('dev'),
        POSTGRES_PASSWORD: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '222.104.218.3',
      port: 32788,
      username: 'postgres',
      database: 'nuber-eats',
      logging: process.env.NODE_ENV !== 'prod',
      password: process.env['POSTGRES_PASSWORD'],
      entities: [Restaurant, User],
      synchronize: process.env.NODE_ENV !== 'prod',
    }),
    RestaurantsModule,
    JwtModule.forRoot({ secretKey: process.env.SECRET_KEY }),
    UsersModule,
    CommonModule,
    JwtModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
