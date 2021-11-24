import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeletePlaceUserRelationInput {
  @Field((type) => Number)
  relationId: number;
}

@ObjectType()
export class DeletePlaceUserRelationOutput extends CoreOutput {}
