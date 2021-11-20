import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Place } from './entities/place.entity';
import { PlacesResolver } from './places.resolver';
import { PlacesService } from './places.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, PlaceUserRelation])],
  providers: [PlacesResolver, PlacesService, Pagination],
})
export class PlacesModule {}
