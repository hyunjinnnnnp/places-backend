import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class GetMyPlaceRelationsInput extends PaginationInput {}

@ObjectType()
export class GetMyPlaceRelationsOutput extends PaginationOutput {
  @Field((type) => [PlaceUserRelation], { nullable: true })
  relations?: PlaceUserRelation[];
}
