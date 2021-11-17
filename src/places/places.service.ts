import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePlaceInput, CreatePlaceOutput } from './dtos/create-place.dto';
import { Place } from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly places: Repository<Place>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}
  async createPlace(
    createPlaceInput: CreatePlaceInput,
  ): Promise<CreatePlaceOutput> {
    try {
      const place = this.places.create(createPlaceInput);
      await this.places.save(place);
      return { ok: true, place };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not create' };
    }
  }

  // async editPlace(editPlaceInput: EditPlaceInput):Promise<EditPlaceOutput>{
  //   try{
  //     const place = this.places.findOne(editPlaceInput.id)

  //   }catch{
  //     return{ok:false, error: 'Could not Edit'}
  //   }
  // }
}
