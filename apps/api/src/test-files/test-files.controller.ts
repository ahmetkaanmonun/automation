import { Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AppRole, JwtUser } from '../common/roles';
import { TestFilesService } from './test-files.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('test-files')
export class TestFilesController {
  constructor(
    private readonly files: TestFilesService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  list(@Query('projectId') projectId?: string, @Query('moduleId') moduleId?: string, @Query('scenarioId') scenarioId?: string) {
    return this.files.list({ projectId, moduleId, scenarioId });
  }

  @Roles(AppRole.Admin, AppRole.Tester)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR ?? 'uploads',
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
      }),
    }),
  )
  upload(
    @CurrentUser() user: JwtUser,
    @UploadedFile() file: Express.Multer.File,
    @Query('projectId') projectId: string,
    @Query('moduleId') moduleId?: string,
    @Query('scenarioId') scenarioId?: string,
  ) {
    return this.files.create(user.id, { file, projectId, moduleId, scenarioId });
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const file = await this.files.get(id);
    return res.download(file.path, file.originalName);
  }

  @Roles(AppRole.Admin)
  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.files.remove(user.id, id);
  }
}

