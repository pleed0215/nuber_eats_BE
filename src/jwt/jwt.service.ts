import { Inject, Injectable } from '@nestjs/common';
import { JWT_OPTIONS } from './jwt.constant';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_OPTIONS) private readonly options: JwtModuleOptions) {
    console.log(options);
  }
  sign(payload: object): string {
    return jwt.sign(payload, this.options.secretKey);
  }
}
