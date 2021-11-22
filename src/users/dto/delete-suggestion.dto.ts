import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteSuggestionInput {
  @Field((type) => Number)
  suggestionId: number;
}

@ObjectType()
export class DeleteSuggestionOutput extends CoreOutput {}
