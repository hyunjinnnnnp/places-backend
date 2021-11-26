import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Place } from '../entities/place.entity';

@InputType()
export class FindPlacesByCategoryInput {
  @Field((type) => Number)
  categoryId: number;
}

@ObjectType()
export class FindPlacesByCategoryOutput extends CoreOutput {
  @Field((type) => [Place], { nullable: true })
  places?: Place[];
}
