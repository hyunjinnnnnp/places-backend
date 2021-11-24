import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Follow } from '../follows/entities/follow.entity';
import { Suggestion } from './entities/suggestion.entity';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification, Follow, Suggestion])],
  providers: [UsersResolver, UsersService, Pagination],
  exports: [UsersService],
})
export class UsersModule {}
