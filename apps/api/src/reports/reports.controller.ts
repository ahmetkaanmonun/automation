import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('executions')
  list(@Query('status') status?: string, @Query('moduleId') moduleId?: string) {
    return this.reports.list({ status, moduleId });
  }

  @Get('executions/:id/export')
  async export(@Param('id') id: string, @Query('format') format: string | undefined, @Res() res: Response) {
    const normalized = format ?? 'html';
    const report = await this.reports.export(id, normalized);
    res.setHeader('Content-Type', report.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    return res.send(report.body);
  }
}

