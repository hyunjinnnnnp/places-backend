import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class EditRelationInput extends PartialType(
  PickType(PlaceUserRelation, ['memo', 'isLiked', 'isVisited']),
) {
  @Field((type) => Number)
  relationId: number;

  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class EditRelationOutput extends CoreOutput {}
