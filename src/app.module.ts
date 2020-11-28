import { Restaurant } from './restaurants/entities/restaurant.entity';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entity/order.entity';
import { OrderItem } from './orders/entity/order-item.entity';

// secret key: FHaITMZg4S6Y8aooKl1O1YPTSIxDW5Vz

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.dev.env' : '.test.env',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test')
          .default('dev'),
        POSTGRES_PASSWORD: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
        MAILGUN_APIKEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_EMAIL: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      include: [RestaurantsModule, UsersModule, OrdersModule],
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, connection }) => {
        if (req) {
          return { user: req['user'] };
        } else {
        }
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '222.104.218.3',
      port: 32788,
      username: 'postgres',
      database: `nuber-eats${process.env.NODE_ENV === 'test' ? '-test' : ''}`,
      logging: process.env.NODE_ENV === 'dev',
      password: process.env['POSTGRES_PASSWORD'],
      entities: [
        Restaurant,
        User,
        Verification,
        Category,
        Dish,
        Order,
        OrderItem,
      ],
      synchronize: process.env.NODE_ENV !== 'prod',
    }),
    JwtModule.forRoot({ secretKey: process.env.SECRET_KEY }),
    MailModule.forRoot({
      mailgunApiKey: process.env.MAILGUN_APIKEY,
      mailgunDomain: process.env.MAILGUN_DOMAIN,
      mailgunEmail: process.env.MAILGUN_EMAIL,
    }),
    RestaurantsModule,
    UsersModule,
    CommonModule,
    AuthModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.ALL,
    });
  }
}
