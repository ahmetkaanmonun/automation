import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole, JwtUser } from '../common/roles';
import { ModuleDto } from './modules.dto';
import { ModulesService } from './modules.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modules')
export class ModulesController {
  constructor(private readonly modules: ModulesService) {}

  @Get()
  list(@Query('projectId') projectId?: string) {
    return this.modules.list(projectId);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: ModuleDto) {
    return this.modules.create(user.id, dto);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Patch(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: Partial<ModuleDto>) {
    return this.modules.update(user.id, id, dto);
  }

  @Roles(AppRole.Admin)
  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.modules.remove(user.id, id);
  }
}

