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

  @OneToMany('Task', 'user')
  tasks!: Task[];
}
