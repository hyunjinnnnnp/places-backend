import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreatePlaceInput, CreatePlaceOutput } from './dtos/create-place.dto';
import { DeletePlaceInput, DeletePlaceOutput } from './dtos/delete-place.dto';
import { EditPlaceInput, EditPlaceOutput } from './dtos/edit-place.dto';
import {
  GetAllPlacesPaginatedInput,
  GetAllPlacesPaginatedOutput,
} from './dtos/get-all-places-paginated.dto';
import { GetAllPlacesOutput } from './dtos/get-all-places.dto';

import { Place } from './entities/place.entity';
import { PlacesService } from './places.service';

@Resolver((of) => Place)
export class PlacesResolver {
  constructor(private readonly placesService: PlacesService) {}

  @Query((returns) => GetAllPlacesPaginatedOutput)
  getAllPlacesPaginated(
    @Args('input') getAllPlacesPaginatedInput: GetAllPlacesPaginatedInput,
  ): Promise<GetAllPlacesOutput> {
    return this.placesService.getAllPlacesPaginated(getAllPlacesPaginatedInput);
  }

  @Query((returns) => GetAllPlacesOutput)
  getAllPlaces(): Promise<GetAllPlacesOutput> {
    return this.placesService.getAllPlaces();
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreatePlaceOutput)
  createPlace(
    @Args('input') createPlaceInput: CreatePlaceInput,
  ): Promise<CreatePlaceOutput> {
    return this.placesService.createPlace(createPlaceInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditPlaceOutput)
  editPlace(
    @Args('input') editPlaceInput: EditPlaceInput,
  ): Promise<EditPlaceOutput> {
    return this.placesService.editPlace(editPlaceInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeletePlaceOutput)
  deletePlace(
    @Args('input') deletePlaceInput: DeletePlaceInput,
  ): Promise<DeletePlaceOutput> {
    return this.placesService.deletePlace(deletePlaceInput);
  }
}
