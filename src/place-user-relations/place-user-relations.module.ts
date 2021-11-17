import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceUserRelation } from './entities/place-user-relation.entity';
import { PlaceUserRelationsService } from './place-user-relations.service';
import { PlaceUserRelationsResolver } from './place-user-relations.resolver';
import { User } from 'src/users/entities/user.entity';
import { Place } from 'src/places/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlaceUserRelation, User, Place])],
  providers: [PlaceUserRelationsService, PlaceUserRelationsResolver],
})
export class PlaceUserRelationsModule {}
