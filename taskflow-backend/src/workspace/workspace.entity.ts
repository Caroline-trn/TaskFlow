import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workspace_project')
export class WorkspaceProject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'user_id' })
  userId!: string;
}

@Entity('workspace_member')
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'user_id' })
  userId!: string;
}
