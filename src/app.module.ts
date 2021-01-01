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
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Category } from './restaurants/entities/category.entity';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entity/order.entity';
import { OrderItem } from './orders/entity/order-item.entity';
import * as jwt from 'jsonwebtoken';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entity/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';

// secret key: FHaITMZg4S6Y8aooKl1O1YPTSIxDW5Vz

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.dev.env' : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'production', 'test')
          .default('dev'),
        DB_PASSWORD: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
        MAILGUN_APIKEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_EMAIL: Joi.string().required(),
        AWS_ACCESS_KEY: Joi.string().required(),
        AWS_SECRET_KEY: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_PORT: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      include: [RestaurantsModule, UsersModule, OrdersModule, PaymentsModule],
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: async ({ req, connection }) => {
        return {
          token: req ? req.headers['x-jwt'] : connection.context['x-jwt'],
        };
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST, //'my.yoyang.io', //'222.104.218.3',
            port: +process.env.DB_PORT,
            username: process.env.DB_USER,
            database: `${process.env.DB_NAME}${
              process.env.NODE_ENV === 'test' ? '-test' : ''
            }`,
            password: process.env.DB_PASSWORD,
          }),
      logging: process.env.NODE_ENV === 'dev',
      entities: [
        Restaurant,
        User,
        Verification,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
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
    PaymentsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
/*
graphql subscription 관련 authorization 문제가 있어서, AuthGuard에서 설정하도록 한다.
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.ALL,
    });
  }
}
*/
