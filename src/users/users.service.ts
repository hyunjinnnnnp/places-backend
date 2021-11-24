import { Injectable } from '@nestjs/common';
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
  MakeSuggestionInput,
  MakeSuggestionOutput,
} from './dto/make-suggestion.dto';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
    @InjectRepository(Suggestion)
    private readonly suggestions: Repository<Suggestion>,
    private readonly pagination: Pagination,
  ) {}

  async createAccount({
    email,
    password,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return {
          ok: false,
          error: 'There is a user with this email already',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password }),
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
      //make a JWT and give it to the user
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
      //jwt.sign({ id: user.id }, this.config.get('SECRET_KEY'));

      //this.config.get() >>dependency injection
      //process.env.SECRET_KEY, <<get config from /app.module 'ConfigModule'
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
      //if failed, throw an error
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
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      //@BeforeUpdate for hashing password
      //triggered when you updated a specific entity
      // this.users.update(userId, { ...editProfileInput });
      //not updating entity. sending query to the DB
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        const verification = await this.verification.save(
          this.verification.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
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

  async makeSuggestion(
    sender: User,
    { message, receiverId, placeId }: MakeSuggestionInput,
  ): Promise<MakeSuggestionOutput> {
    try {
      const receiver = await this.users.findOne(receiverId);
      if (!receiver) {
        return { ok: false, error: 'User not found' };
      }
      //follow 관계 확인
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
        this.suggestions.create({ sender, receiver, message, placeId }),
      );
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
