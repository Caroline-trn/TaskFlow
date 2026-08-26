import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember, WorkspaceProject } from './workspace.entity';
import { User } from '../users/user.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(WorkspaceProject) private readonly projects: Repository<WorkspaceProject>,
    @InjectRepository(WorkspaceMember) private readonly members: Repository<WorkspaceMember>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  listProjects(userId: string) { return this.projects.find({ where: { userId }, order: { name: 'ASC' } }); }
  listMembers(userId: string) { return this.members.find({ where: { userId }, order: { name: 'ASC' } }); }
  createProject(userId: string, name: string) { return this.projects.save(this.projects.create({ userId, name })); }
  createMember(userId: string, name: string) { return this.members.save(this.members.create({ userId, name })); }
  async getSettings(userId: string) { const user = await this.users.findOneByOrFail({ id: userId }); return { notificationsEnabled: user.notificationsEnabled, darkMode: user.darkMode }; }
  async updateSettings(userId: string, settings: { notificationsEnabled?: boolean; darkMode?: boolean }) { await this.users.update({ id: userId }, settings); return this.getSettings(userId); }
}
