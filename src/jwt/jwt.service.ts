import { Inject, Injectable } from '@nestjs/common';
import { JWT_OPTIONS } from './jwt.constant';

import { JwtModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(@Inject(JWT_OPTIONS) private readonly options: JwtModuleOptions) {
    console.log(options);
  }
  hello() {
    console.log('hello');
  }
}
