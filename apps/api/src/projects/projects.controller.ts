import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole, JwtUser } from '../common/roles';
import { ProjectDto } from './projects.dto';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.list();
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: ProjectDto) {
    return this.projects.create(user.id, dto);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Patch(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: ProjectDto) {
    return this.projects.update(user.id, id, dto);
  }

  @Roles(AppRole.Admin)
  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.projects.remove(user.id, id);
  }
}

