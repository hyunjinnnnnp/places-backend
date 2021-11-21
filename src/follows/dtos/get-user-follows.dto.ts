import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Follow } from '../entities/follow.entity';

@InputType()
export class GetUserFollowsInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class GetUserFollowsOutput extends CoreOutput {
  @Field((type) => [Follow], { nullable: true })
  followers?: Follow[];
  @Field((type) => [Follow], { nullable: true })
  following?: Follow[];
}
