import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePlaceInput, CreatePlaceOutput } from './dtos/create-place.dto';
import { UpdatePlaceDto } from './dtos/update-place.dto';
import { Place } from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly places: Repository<Place>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}
  getAll(): Promise<Place[]> {
    return this.places.find();
  }
  async createPlace(
    userId: number,
    createPlaceInput: CreatePlaceInput,
  ): Promise<CreatePlaceOutput> {
    try {
      const place = this.places.create(createPlaceInput);
      await this.places.save(place);
      return { ok: true, place };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }
}
