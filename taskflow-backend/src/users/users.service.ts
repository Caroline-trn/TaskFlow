import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByResetToken(tokenHash: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.resetTokenHash', 'user.resetTokenExpiresAt'])
      .where('user.resetTokenHash = :tokenHash', { tokenHash })
      .andWhere('user.resetTokenExpiresAt > :now', { now: new Date() })
      .getOne();
  }

  async update(user: User, data: Partial<User>): Promise<User> {
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }
}
