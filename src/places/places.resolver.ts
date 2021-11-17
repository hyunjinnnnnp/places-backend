import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreatePlaceInput, CreatePlaceOutput } from './dtos/create-place.dto';
import { Place } from './entities/place.entity';
import { PlacesService } from './places.service';

@Resolver((of) => Place)
export class PlacesResolver {
  constructor(private readonly placesService: PlacesService) {}

  // @Query()
  // places()

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreatePlaceOutput)
  createPlace(
    @Args('input') createPlaceInput: CreatePlaceInput,
  ): Promise<CreatePlaceOutput> {
    return this.placesService.createPlace(createPlaceInput);
  }

  // @UseGuards(AuthGuard)
  // @Mutation((returns) => EditPlaceOutput)
  // editPlace(
  //   @Args('input') editPlaceInput: EditPlaceInput,
  // ): Promise<EditPlaceOutput> {
  //   return this.placesService.editPlace(editPlaceInput);
  // }
}
