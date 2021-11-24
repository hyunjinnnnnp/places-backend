import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Place } from '../entities/place.entity';

@ObjectType()
export class GetAllPlacesOutput extends CoreOutput {
  @Field((type) => [Place], { nullable: true })
  places?: Place[];
}
