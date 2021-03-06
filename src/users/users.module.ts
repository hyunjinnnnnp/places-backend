import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Place } from 'src/places/entities/place.entity';
import { Follow } from '../follows/entities/follow.entity';
import { Suggestion } from './entities/suggestion.entity';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification, Follow, Suggestion, Place]),
  ],
  providers: [UsersResolver, UsersService, Pagination],
  exports: [UsersService],
})
export class UsersModule {}
