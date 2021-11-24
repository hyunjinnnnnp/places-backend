import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Suggestion } from '../entities/suggestion.entity';

@InputType()
export class MakeSuggestionInput extends PickType(Suggestion, [
  'receiverId',
  'message',
]) {
  @Field((type) => Number)
  placeId: number;
}

@ObjectType()
export class MakeSuggestionOutput extends CoreOutput {
  @Field((type) => Suggestion, { nullable: true })
  suggestion?: Suggestion;
}
