import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Place } from '../entities/place.entity';

@InputType()
export class GetAllPlacesPaginatedInput extends PaginationInput {}

@ObjectType()
export class GetAllPlacesPaginatedOutput extends PaginationOutput {
  @Field((type) => [Place], { nullable: true })
  places?: Place[];
}
