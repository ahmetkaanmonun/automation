import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole, JwtUser } from '../common/roles';
import { StartExecutionDto } from './executions.dto';
import { ExecutionsService } from './executions.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executions: ExecutionsService) {}

  @Get()
  list() {
    return this.executions.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.executions.get(id);
  }

  @Get(':id/logs')
  logs(@Param('id') id: string) {
    return this.executions.logs(id);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post()
  start(@CurrentUser() user: JwtUser, @Body() dto: StartExecutionDto) {
    return this.executions.start(user.id, dto);
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post(':id/retry')
  retry(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.executions.retry(user.id, id);
  }
}

