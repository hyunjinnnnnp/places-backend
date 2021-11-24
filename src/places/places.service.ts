import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Repository } from 'typeorm';
import { CreatePlaceInput, CreatePlaceOutput } from './dtos/create-place.dto';
import { DeletePlaceInput, DeletePlaceOutput } from './dtos/delete-place.dto';
import { EditPlaceInput, EditPlaceOutput } from './dtos/edit-place.dto';
import {
  GetAllPlacesPaginatedInput,
  GetAllPlacesPaginatedOutput,
} from './dtos/get-all-places-paginated.dto';
import { GetAllPlacesOutput } from './dtos/get-all-places.dto';

import { Place } from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly places: Repository<Place>,
    @InjectRepository(PlaceUserRelation)
    private readonly relations: Repository<PlaceUserRelation>,
    private readonly paginate: Pagination,
  ) {}

  async getAllPlacesPaginated({
    page,
  }: GetAllPlacesPaginatedInput): Promise<GetAllPlacesPaginatedOutput> {
    try {
      const [places, totalResults] = await this.paginate.getResults(
        this.places,
        page,
      );
      const totalPages = await this.paginate.getTotalPages(totalResults);
      return {
        ok: true,
        places,
        totalPages,
        totalResults,
      };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async getAllPlaces(): Promise<GetAllPlacesOutput> {
    try {
      const places = await this.places.find();
      return {
        ok: true,
        places,
      };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async createPlace(
    createPlaceInput: CreatePlaceInput,
  ): Promise<CreatePlaceOutput> {
    try {
      const place = this.places.create({ ...createPlaceInput });
      await this.places.save(place);
      return { ok: true, place };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }

  async editPlace({
    placeId,
    name,
    address,
    coverImg,
  }: EditPlaceInput): Promise<EditPlaceOutput> {
    try {
      //to do: auto edit
      // if Place info !== google info
      const place = await this.places.findOne(placeId);
      if (!place) {
        return { ok: false, error: 'Place not found' };
      }
      const newPlace = await this.places.save({
        id: placeId,
        address,
        name,
        coverImg,
      });
      return {
        ok: true,
        place: newPlace,
      };
    } catch {
      return { ok: false, error: 'Could not Edit' };
    }
  }

  async deletePlace({ placeId }: DeletePlaceInput): Promise<DeletePlaceOutput> {
    try {
      //to do: delete places if the place's relations don't exist anymore.
      //auto delete ?
      const place = await this.places.findOne(placeId);
      if (!place) {
        return { ok: false, error: 'Place not found' };
      }
      const relation = await this.relations.findOne({ placeId });
      if (relation) {
        return { ok: false, error: 'Relation exists. Could not delete' };
      }
      await this.places.delete(placeId);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete' };
    }
  }
}
