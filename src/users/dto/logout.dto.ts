import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class LogoutInput {
  @Field((type) => String)
  token: string;
}

@ObjectType()
export class LogoutOutput extends CoreOutput {}
