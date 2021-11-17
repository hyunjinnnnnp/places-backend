import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class GetUserRelationsInput extends PaginationInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class GetUserRelationsOutput extends PaginationOutput {
  @Field((type) => [PlaceUserRelation], { nullable: true })
  relations?: PlaceUserRelation[];
}
