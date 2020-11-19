import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';

import { User } from '../entities/user.entity';

@InputType()
class UserExceptPasswordId extends OmitType(
  User,
  ['id', 'password'] as const,
  InputType,
) {}

@InputType()
export class UpdateProfileInput extends PartialType(
  UserExceptPasswordId,
  InputType,
) {}

@ObjectType()
export class UpdateProfileOutput extends CommonOutput {
  @Field(type => User, { nullable: true })
  updated?: UpdateProfileInput;
}

@ArgsType()
export class UpdatePasswordInput {
  @Field(type => String)
  password: string;
}
