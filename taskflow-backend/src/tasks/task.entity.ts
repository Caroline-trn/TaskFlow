import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { User } from '../users/user.entity';

export enum TaskPriority {
  LOW = 'basse',
  MEDIUM = 'moyenne',
  HIGH = 'haute',
}

export enum TaskStatus {
  PENDING = 'en_attente',
  IN_PROGRESS = 'en_cours',
  COMPLETED = 'terminee',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'date', nullable: true })
  dueDate!: string | null;

  @Column({ default: false })
  archived!: boolean;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @ManyToOne('User', 'tasks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @CreateDateColumn()
  created_at!: Date;
}
