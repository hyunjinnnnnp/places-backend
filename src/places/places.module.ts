import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relation } from 'src/common/entities/relation.entity';
import { User } from 'src/users/entities/user.entity';
import { Place } from './entities/place.entity';
import { PlacesResolver } from './places.resolver';
import { PlacesService } from './places.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place, User, Relation])],
  providers: [PlacesResolver, PlacesService],
})
export class PlacesModule {}
