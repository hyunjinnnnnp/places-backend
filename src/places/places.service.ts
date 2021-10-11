import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlaceDto } from './dtos/create-place.dto';
import { UpdatePlaceDto } from './dtos/update-place.dto';
import { Place } from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly places: Repository<Place>,
  ) {}
  getAll(): Promise<Place[]> {
    return this.places.find();
  }
  createPlace(createPlaceDto: CreatePlaceDto): Promise<Place> {
    const newPlace = this.places.create(createPlaceDto);
    return this.places.save(newPlace);
  }

  updatePlace({ id, data }: UpdatePlaceDto) {
    return this.places.update(id, { ...data });
  }
}
