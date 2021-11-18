import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class SearchUserRelationInput extends PaginationInput {
  @Field((type) => String)
  query: string;

  @Field((type) => Number)
  page: number;

  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class SearchUserRelationOutput extends PaginationOutput {
  @Field((type) => [PlaceUserRelation], { nullable: true })
  relations?: PlaceUserRelation[];
}
