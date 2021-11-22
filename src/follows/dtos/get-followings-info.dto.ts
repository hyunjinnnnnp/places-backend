import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class GetFollowingUsersInfoInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class GetFollowingUsersInfoOutput extends CoreOutput {
  @Field((type) => [User], { nullable: true })
  following?: User[];
}
