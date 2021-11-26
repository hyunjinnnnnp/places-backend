import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Category } from './entities/category.entity';
import { Place } from './entities/place.entity';
import { PlacesResolver } from './places.resolver';
import { PlacesService } from './places.service';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
      PlaceUserRelation,
      CategoryRepository,
      Category,
    ]),
  ],
  providers: [PlacesResolver, PlacesService, Pagination, CategoryRepository],
})
export class PlacesModule {}
