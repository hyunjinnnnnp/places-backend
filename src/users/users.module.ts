import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relation } from 'src/common/entities/relation.entity';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification, Relation])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
