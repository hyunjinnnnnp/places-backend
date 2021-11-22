import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Suggestion } from '../entities/suggestion.entity';

@InputType()
export class GetPrivateSuggestionsInput {
  @Field((type) => Number)
  followerId: number;
}
@ObjectType()
export class GetPrivateSuggestionsOutput extends CoreOutput {
  @Field((type) => [Suggestion], { nullable: true })
  suggestions?: Suggestion[];
}
