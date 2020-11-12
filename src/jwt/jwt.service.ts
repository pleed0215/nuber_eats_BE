import { Inject, Injectable } from '@nestjs/common';
import { JWT_OPTIONS } from './jwt.constant';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(JWT_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  sign(userid: number): string {
    return jwt.sign({ id: userid }, this.options.secretKey);
  }
  verify(token: string) {
    return jwt.verify(token, this.options.secretKey);
  }
}
