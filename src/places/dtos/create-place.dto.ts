import { InputType, OmitType } from '@nestjs/graphql';
import { Place } from '../entities/place.entity';

@InputType()
export class CreatePlaceDto extends OmitType(Place, ['id']) {}
