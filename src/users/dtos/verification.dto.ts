import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';

@ObjectType()
export class VerificationOutput extends CommonOutput {}

@ArgsType()
export class VerificationInput {
  @Field(type => String)
  code: string;
}
