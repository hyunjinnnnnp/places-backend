import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { UserProfileOutput } from './dto/user-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
        error: null,
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
      const user = await this.users.findOne({ id });
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
      this.users.save(user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not edit' };
    }
  }
  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
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
      return { ok: false, error };
    }
  }
}
