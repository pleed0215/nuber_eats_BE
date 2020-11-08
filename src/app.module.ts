import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
import * as Joi from 'joi';

console.log(
  join(
    __dirname,
    process.env.NODE_ENV === 'prod' ? 'dist' : 'src',
    '**',
    '*.entity.{ts,.js}',
  ),
);

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
      entities: [Restaurant],
      synchronize: process.env.NODE_ENV !== 'prod',
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
