import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeletePlaceInput {
  @Field((type) => Number)
  placeId: number;
}

@ObjectType()
export class DeletePlaceOutput extends CoreOutput {}
