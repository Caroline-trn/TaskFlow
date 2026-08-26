import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';

type AuthenticatedRequest = Request & { user: { userId: string } };

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspace: WorkspaceService) {}

  @Get('projects')
  projects(@Req() request: AuthenticatedRequest) { return this.workspace.listProjects(request.user.userId); }

  @Post('projects')
  createProject(@Req() request: AuthenticatedRequest, @Body('name') name: string) { return this.workspace.createProject(request.user.userId, name.trim()); }

  @Get('members')
  members(@Req() request: AuthenticatedRequest) { return this.workspace.listMembers(request.user.userId); }

  @Post('members')
  createMember(@Req() request: AuthenticatedRequest, @Body('name') name: string) { return this.workspace.createMember(request.user.userId, name.trim()); }

  @Get('settings')
  settings(@Req() request: AuthenticatedRequest) { return this.workspace.getSettings(request.user.userId); }

  @Post('settings')
  updateSettings(@Req() request: AuthenticatedRequest, @Body() settings: { notificationsEnabled?: boolean; darkMode?: boolean }) { return this.workspace.updateSettings(request.user.userId, settings); }
}
