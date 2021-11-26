import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Place } from '../entities/place.entity';

@InputType()
export class CreatePlaceInput extends PickType(Place, ['name', 'address']) {
  @Field((type) => String, { nullable: true })
  coverImg?: string;

  @Field((type) => String, { nullable: true })
  categoryName?: string;
}

@ObjectType()
export class CreatePlaceOutput extends CoreOutput {
  @Field((type) => Place, { nullable: true })
  place?: Place;
}
