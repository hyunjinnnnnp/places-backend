import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Place } from './entities/place.entity';
import { PlacesResolver } from './places.resolver';
import { PlacesService } from './places.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, PlaceUserRelation])],
  providers: [PlacesResolver, PlacesService],
})
export class PlacesModule {}
