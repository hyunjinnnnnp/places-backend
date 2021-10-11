import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreatePlaceDto } from './dtos/create-place.dto';
import { UpdatePlaceDto } from './dtos/update-place.dto';
import { Place } from './entities/place.entity';
import { PlacesService } from './places.service';

@Resolver((of) => Place)
export class PlacesResolver {
  constructor(private readonly placesService: PlacesService) {}
  @Query((returns) => [Place])
  places(): Promise<Place[]> {
    return this.placesService.getAll();
  }

  @Mutation((returns) => Boolean)
  async createPlace(
    @Args('input') createPlaceDto: CreatePlaceDto,
  ): Promise<boolean> {
    try {
      await this.placesService.createPlace(createPlaceDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation((returns) => Boolean)
  async updatePlace(@Args('input') updatePlaceDto: UpdatePlaceDto) {
    try {
      await this.placesService.updatePlace(updatePlaceDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
