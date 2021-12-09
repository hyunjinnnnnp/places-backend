import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Place } from '../entities/place.entity';

@InputType()
export class EditPlaceInput extends PartialType(
  PickType(Place, ['name', 'address']),
) {
  @Field((type) => Number)
  placeId: number;
}

@ObjectType()
export class EditPlaceOutput extends CoreOutput {
  @Field((type) => Place, { nullable: true })
  place?: Place;
}
