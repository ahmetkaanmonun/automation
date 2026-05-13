import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole, JwtUser } from '../common/roles';
import { ScenarioDto } from './scenarios.dto';
import { ScenariosService } from './scenarios.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scenarios')
export class ScenariosController {
  constructor(private readonly scenarios: ScenariosService) {}

  @Get()
  list(@Query('projectId') projectId?: string, @Query('moduleId') moduleId?: string, @Query('environment') environment?: string, @Query('tag') tag?: string) {
    return this.scenarios.list({ projectId, moduleId, environment, tag });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.scenarios.get(id);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: ScenarioDto) {
    return this.scenarios.create(user.id, dto);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Patch(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: ScenarioDto) {
    return this.scenarios.update(user.id, id, dto);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post(':id/clone')
  clone(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.scenarios.clone(user.id, id);
  }

  @Roles(AppRole.Admin)
  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.scenarios.remove(user.id, id);
  }
}

