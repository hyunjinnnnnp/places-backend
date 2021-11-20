import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Follow } from '../entities/follow.entity';

@InputType('CreateFollowInputType', { isAbstract: true })
@ObjectType()
export class CreateFollowInput extends PickType(Follow, [
  'followerId',
  'followingId',
]) {}

@ObjectType()
export class CreateFollowOutput extends CoreOutput {}
