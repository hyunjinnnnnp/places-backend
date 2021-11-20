import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class GetUserFollowersInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class GetUserFollowersOutput extends CoreOutput {
  @Field((type) => [User], { nullable: true })
  followers?: User[];
}
