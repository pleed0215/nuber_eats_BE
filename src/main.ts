import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();

/*MAILG
UN_APIKEY=dc52277897
8538be
33a08b
2a9e19d7d7-4d
640632-2c4feb39
MAILGUN_URL=https://api.mailgun.net/v3/sandbox857418504ffe4144bc9c19e3d65f2430.mailgun.org
MAILGUN_DOMAIN=sandbox857418504ffe4144bc9c19e3d65f2430.mailgun.org
MAILGUN_EMAIL=pleed0215@yoyang.io*/
