import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';

import { User } from '../entities/user.entity';

@InputType()
export class UpdateProfileInput extends PartialType(User, InputType) {}

@ObjectType()
export class UpdateProfileOutput extends CommonOutput {
  @Field(type => User, { nullable: true })
  updated?: User;
}
