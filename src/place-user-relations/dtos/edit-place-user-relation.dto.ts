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
export class EditPlaceUserRelationInput extends PartialType(
  PickType(PlaceUserRelation, ['memo', 'isLiked', 'isVisited']),
) {
  @Field((type) => Number)
  relationId: number;
}

@ObjectType()
export class EditPlaceUserRelationOutput extends CoreOutput {}