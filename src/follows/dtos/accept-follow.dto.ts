import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Follow } from '../entities/follow.entity';

@InputType()
export class AcceptFollowInput extends PickType(Follow, ['id']) {}

@ObjectType()
export class AcceptFollowOutput extends CoreOutput {}
