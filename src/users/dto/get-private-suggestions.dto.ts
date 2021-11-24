import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Suggestion } from '../entities/suggestion.entity';

@InputType()
export class GetPrivateSuggestionsInput extends PaginationInput {
  @Field((type) => Number)
  followerId: number;
}
@ObjectType()
export class GetPrivateSuggestionsOutput extends PaginationOutput {
  @Field((type) => [Suggestion], { nullable: true })
  suggestions?: Suggestion[];
}
