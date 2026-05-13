import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole, JwtUser } from '../common/roles';
import { LocatorDto } from './locators.dto';
import { LocatorsService } from './locators.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locators')
export class LocatorsController {
  constructor(private readonly locators: LocatorsService) {}

  @Get()
  list(
    @Query('projectId') projectId?: string,
    @Query('moduleId') moduleId?: string,
    @Query('q') q?: string,
    @Query('active') active?: string,
  ) {
    return this.locators.list({ projectId, moduleId, q, active });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.locators.get(id);
  }

  @Get(':id/versions')
  versions(@Param('id') id: string) {
    return this.locators.versions(id);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: LocatorDto) {
    return this.locators.create(user.id, dto);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Patch(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: Partial<LocatorDto>) {
    return this.locators.update(user.id, id, dto);
  }

  @Roles(AppRole.Admin)
  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.locators.remove(user.id, id);
  }
}

