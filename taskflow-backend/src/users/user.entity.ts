import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import type { Task } from '../tasks/task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ default: true })
  notificationsEnabled!: boolean;

  @Column({ default: false })
  darkMode!: boolean;

  @Column({ nullable: true, select: false })
  resetTokenHash!: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetTokenExpiresAt!: Date | null;

  @OneToMany('Task', 'user')
  tasks!: Task[];
}
