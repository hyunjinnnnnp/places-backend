import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class UnfollowInput {
  @Field((type) => Number)
  followingId: number;
}

@ObjectType()
export class UnfollowOutput extends CoreOutput {}
