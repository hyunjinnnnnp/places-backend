import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { UserProfileOutput } from './dto/user-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { MailService } from 'src/mail/mail.service';
import {
  CreateSuggestionInput,
  CreateSuggestionOutput,
} from './dto/create-suggestion.dto';
import { User } from './entities/user.entity';
import { Follow } from 'src/follows/entities/follow.entity';
import { Suggestion } from './entities/suggestion.entity';
import {
  GetPrivateSuggestionsInput,
  GetPrivateSuggestionsOutput,
} from './dto/get-private-suggestions.dto';
import {
  DeleteSuggestionInput,
  DeleteSuggestionOutput,
} from './dto/delete-suggestion.dto';
import { Pagination } from 'src/common/common.pagination';
import { NEW_PENDING_SUGGESTION, PUB_SUB } from 'src/common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { Place } from 'src/places/entities/place.entity';
import { MyProfileOutput } from './dto/my-profile.dto';
import { LogoutInput, LogoutOutput } from './dto/logout.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Place) private readonly places: Repository<Place>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
    @InjectRepository(Suggestion)
    private readonly suggestions: Repository<Suggestion>,
    private readonly pagination: Pagination,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async myProfile({ id }: User): Promise<MyProfileOutput> {
    try {
      const user = await this.users
        .createQueryBuilder('user')
        .select([
          'user.id AS id',
          'user.email AS email',
          'user.nickname AS nickname',
          'user.verified AS verified',
          'user.avatarUrl AS "avatarUrl"',
        ])
        .leftJoin('user.following', 'following')
        .leftJoin('user.relations', 'relations')
        .leftJoin('user.followers', 'followers')
        .addSelect('COUNT(DISTINCT FOLLOWING) AS "followingCount"')
        .addSelect('COUNT(DISTINCT RELATIONS) AS "relationsCount"')
        .addSelect('COUNT(DISTINCT FOLLOWERS) AS "followersCount"')
        .where('user.id = :id', { id })
        .groupBy('user.id')
        .getRawOne();
      return {
        ok: true,
        user,
        followingCount: user.followingCount,
        followersCount: user.followersCount,
        relationsCount: user.relationsCount,
      };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }
  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const emailExists = await this.users.findOne({
        email: createAccountInput.email,
      });
      if (emailExists) {
        return {
          ok: false,
          error: 'There is a user with this email already',
        };
      }
      const nameExists = await this.users.findOne({
        nickname: createAccountInput.nickname,
      });
      if (nameExists) {
        return {
          ok: false,
          error: 'There is a user with this name already',
        };
      }
      const user = await this.users.save(
        this.users.create({ ...createAccountInput }),
      );
      const verification = await this.verification.save(
        this.verification.create({ user }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create account',
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Please verify your password',
        };
      }
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not login',
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch {
      return { ok: false, error: 'User not found' };
    }
  }

  async editProfile(
    userId: number,
    { email, nickname, avatarUrl }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email !== user.email) {
        user.email = email;
        user.verified = false;
        const verification = await this.verification.save(
          this.verification.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (nickname !== user.nickname) {
        user.nickname = nickname;
      }
      if (avatarUrl !== user.avatarUrl) {
        user.avatarUrl = avatarUrl;
      }
      await this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not edit' };
    }
  }
  async verifyEmail({ code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return { ok: false, error: 'Could not verify email' };
    }
  }

  async getPrivateSuggestions(
    authUser: User,
    { followerId, page }: GetPrivateSuggestionsInput,
  ): Promise<GetPrivateSuggestionsOutput> {
    try {
      const [_, isBiDirectionalFollowing] = await this.follows.findAndCount({
        where: [
          { followerId: authUser.id, followingId: followerId },
          { followerId, followingId: authUser.id },
        ],
      });
      if (isBiDirectionalFollowing !== 2) {
        return {
          ok: false,
          error: 'Could not found relations between users',
        };
      }
      const findOptions = {
        where: [
          { senderId: authUser.id, receiverId: followerId },
          { senderId: followerId, receiverId: authUser.id },
        ],
      };
      const [suggestions, totalResults] = await this.pagination.getResults(
        this.suggestions,
        page,
        findOptions,
      );
      const totalPages = await this.pagination.getTotalPages(totalResults);
      return {
        ok: true,
        suggestions,
        totalPages,
        totalResults,
      };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async createSuggestion(
    sender: User,
    { message, receiverId, placeId }: CreateSuggestionInput,
  ): Promise<CreateSuggestionOutput> {
    try {
      const receiver = await this.users.findOne(receiverId);
      if (!receiver) {
        return { ok: false, error: 'User not found' };
      }
      const place = await this.places.findOne(placeId);
      if (!place) {
        return { ok: false, error: 'Place not found' };
      }
      //follow 관계 확인 >> count ㄹㅗ ㄷㅐ체
      const [_, isBidirectionalFollow] = await this.follows.findAndCount({
        where: [
          {
            followerId: sender.id,
            followingId: receiverId,
          },
          { followerId: receiverId, followingId: sender.id },
        ],
      });
      if (isBidirectionalFollow < 2) {
        return {
          ok: false,
          error:
            "Could not make a suggestion if you're not following each other",
        };
      }
      const suggestion = await this.suggestions.save(
        this.suggestions.create({ sender, receiver, message, place }),
      );
      if (suggestion) {
        await this.pubSub.publish(NEW_PENDING_SUGGESTION, {
          pendingSuggestion: { suggestion, receiverId },
        });
      }
      return { ok: true, suggestion };
    } catch {
      return { ok: false, error: 'Could not make' };
    }
  }

  async deleteSuggestion(
    user: User,
    { suggestionId }: DeleteSuggestionInput,
  ): Promise<DeleteSuggestionOutput> {
    try {
      const suggestion = await this.suggestions.findOne(suggestionId);
      if (!suggestion) {
        return { ok: false, error: 'Could not found suggestion' };
      }
      //sender only can remove suggestions (?)
      if (suggestion.senderId !== user.id) {
        return {
          ok: false,
          error: 'Could not delete suggestion belongs to you',
        };
      }
      await this.suggestions.remove(suggestion);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete' };
    }
  }
}
