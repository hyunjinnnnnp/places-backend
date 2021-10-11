import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { PlacesResolver } from './places.resolver';
import { PlacesService } from './places.service';

@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  providers: [PlacesResolver, PlacesService],
})
export class PlacesModule {}
