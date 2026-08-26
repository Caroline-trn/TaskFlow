import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceMember, WorkspaceProject } from './workspace.entity';
import { WorkspaceService } from './workspace.service';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceProject, WorkspaceMember, User])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
