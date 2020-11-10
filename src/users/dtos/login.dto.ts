import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class LoginInput extends PickType(
  User,
  ['email', 'password'] as const,
  ArgsType,
) {}

@ObjectType()
export class LoginOutput extends CommonOutput {
  @Field(type => String, { nullable: true })
  token?: string;
}
