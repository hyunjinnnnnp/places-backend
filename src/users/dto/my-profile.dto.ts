import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class MyProfileOutput extends CoreOutput {
  @Field((type) => User, { nullable: true })
  user?: User;

  @Field((type) => Number, { nullable: true })
  followingCount?: number;

  @Field((type) => Number, { nullable: true })
  followersCount?: number;

  @Field((type) => Number, { nullable: true })
  relationsCount?: number;
}
