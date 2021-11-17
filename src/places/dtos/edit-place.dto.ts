import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreatePlaceInput } from './create-place.dto';

@InputType()
export class EditPlaceInput extends PartialType(CreatePlaceInput) {}

@ObjectType()
export class EditPlaceOutput extends CoreOutput {
  @Field((type) => EditPlaceInput)
  data: EditPlaceInput;
}
