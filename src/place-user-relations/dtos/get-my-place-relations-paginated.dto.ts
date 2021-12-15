import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class GetMyPlaceRelationsPaginatedInput extends PaginationInput {}

@ObjectType()
export class GetMyPlaceRelationsPaginatedOutput extends PaginationOutput {
  @Field((type) => [PlaceUserRelation], { nullable: true })
  relations?: PlaceUserRelation[];
}
