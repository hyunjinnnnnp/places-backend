import { Module } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { FollowsService } from './follows.service';
import { FollowsResolver } from './follows.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow])],
  providers: [FollowsService, FollowsResolver],
})
export class FollowsModule {}
