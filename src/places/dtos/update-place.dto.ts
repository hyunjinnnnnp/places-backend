import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreatePlaceDto } from './create-place.dto';

@InputType()
class UpdatePlaceInputType extends PartialType(CreatePlaceDto) {}

@InputType()
export class UpdatePlaceDto {
  @Field((type) => Int)
  id: number;

  @Field((type) => UpdatePlaceInputType)
  data: UpdatePlaceInputType;
}
