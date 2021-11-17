import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteRelationInput {
  @Field((type) => Number)
  relationId: number;
}

@ObjectType()
export class DeleteRelationOutput extends CoreOutput {}
