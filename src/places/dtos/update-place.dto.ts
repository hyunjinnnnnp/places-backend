import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreatePlaceInput } from './create-place.dto';

@InputType()
class UpdatePlaceInputType extends PartialType(CreatePlaceInput) {}

@InputType()
export class UpdatePlaceDto {
  @Field((type) => Int)
  id: number;

  @Field((type) => UpdatePlaceInputType)
  data: UpdatePlaceInputType;
}
