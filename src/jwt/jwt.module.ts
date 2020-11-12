import { DynamicModule, Global, Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JWT_OPTIONS } from './jwt.constant';
import { JwtModuleOptions } from './jwt.interfaces';

import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: JWT_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
      exports: [JWT_OPTIONS, JwtService],
    };
  }
}
