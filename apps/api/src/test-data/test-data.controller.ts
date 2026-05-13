import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole, JwtUser } from '../common/roles';
import { TestDataDto } from './test-data.dto';
import { TestDataService } from './test-data.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('test-data')
export class TestDataController {
  constructor(private readonly testData: TestDataService) {}

  @Get()
  list(@Query('projectId') projectId?: string, @Query('moduleId') moduleId?: string, @Query('environment') environment?: string) {
    return this.testData.list({ projectId, moduleId, environment });
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: TestDataDto) {
    return this.testData.create(user.id, dto);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Patch(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: Partial<TestDataDto>) {
    return this.testData.update(user.id, id, dto);
  }

  @Roles(AppRole.Admin)
  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.testData.remove(user.id, id);
  }
}

