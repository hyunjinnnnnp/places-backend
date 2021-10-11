import { Query, Resolver } from '@nestjs/graphql';
import { Place } from './entities/place.entity';

@Resolver((of) => Place)
export class PlacesResolver {
  @Query((type) => [Place])
  myPlace(): Place[] {
    return [];
  }
}
