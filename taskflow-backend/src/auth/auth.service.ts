import { ConflictException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/user.entity.js';
import { MailService } from './mail.service';

type SafeUser = Omit<User, 'password'>;
type CreateUserData = Pick<User, 'email' | 'password' | 'name'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return this.removePassword(user);
    }
    return null;
  }

  async accountExists(email: string): Promise<boolean> {
    return Boolean(await this.usersService.findByEmail(email.trim().toLowerCase()));
  }

  login(user: SafeUser) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(createUserDto: CreateUserData): Promise<SafeUser> {
    const email = createUserDto.email.trim().toLowerCase();
    createUserDto.password = createUserDto.password.trim();
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Cette adresse email est déjà utilisée.');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      email,
      password: hashedPassword,
    });
    return this.removePassword(user);
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);
    return { id: user.id, email: user.email, name: user.name };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email.trim().toLowerCase());
    const response = { message: 'Si cette adresse existe, un lien de réinitialisation a été envoyé par email.' };
    if (!user) return response;
    const resetToken = randomBytes(32).toString('hex');
    await this.usersService.update(user, {
      resetTokenHash: createHash('sha256').update(resetToken).digest('hex'),
      resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    try {
      await this.mailService.sendPasswordReset(user.email, resetToken);
    } catch (error) {
      await this.usersService.update(user, {
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      });
      throw error;
    }
    return response;
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetToken(tokenHash);
    if (!user) throw new ConflictException('Le lien de réinitialisation est invalide ou expiré.');
    await this.usersService.update(user, {
      password: await bcrypt.hash(password.trim(), 10),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    });
    return { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' };
  }

  private removePassword(user: User): SafeUser {
    const { password: ignoredPassword, ...result } = user;
    void ignoredPassword;
    return result;
  }
}
