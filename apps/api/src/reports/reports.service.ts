import { Injectable } from '@nestjs/common';
import { ExecutionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ReportQuery = {
  status?: string;
  moduleId?: string;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ReportQuery) {
    return this.prisma.execution.findMany({
      where: {
        status: query.status as ExecutionStatus | undefined,
        scenario: query.moduleId ? { moduleId: query.moduleId } : undefined,
      },
      include: {
        scenario: { include: { module: true, project: true } },
        startedBy: { select: { fullName: true, email: true } },
        logs: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async export(id: string, format: string) {
    const execution = await this.prisma.execution.findUniqueOrThrow({
      where: { id },
      include: {
        scenario: { include: { module: true, project: true } },
        startedBy: { select: { fullName: true, email: true } },
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });

    const rows = [
      ['Scenario', execution.scenario.name],
      ['Project', execution.scenario.project.name],
      ['Module', execution.scenario.module.name],
      ['Environment', execution.environment],
      ['Status', execution.status],
      ['Started By', execution.startedBy.fullName],
      ['Started At', execution.startedAt?.toISOString() ?? ''],
      ['Finished At', execution.finishedAt?.toISOString() ?? ''],
      ['Duration Ms', String(execution.durationMs ?? '')],
      ['Error', execution.errorMessage ?? ''],
      ['Screenshot', execution.screenshotPath ?? ''],
    ];

    if (format === 'xlsx' || format === 'excel' || format === 'csv') {
      const body = [
        'Field,Value',
        ...rows.map(([key, value]) => `${this.csv(key)},${this.csv(value)}`),
        '',
        'Log Status,Message,Created At',
        ...execution.logs.map((log) => `${this.csv(log.status)},${this.csv(log.message)},${this.csv(log.createdAt.toISOString())}`),
      ].join('\n');
      return {
        body,
        contentType: 'text/csv; charset=utf-8',
        filename: `execution-${execution.id}.csv`,
      };
    }

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${this.escape(execution.scenario.name)}</title>
<style>body{font-family:Arial,sans-serif;margin:32px;color:#172033}table{border-collapse:collapse;width:100%;margin:16px 0}td,th{border:1px solid #d8dee9;padding:8px;text-align:left}.FAILED{color:#b91c1c}.PASSED{color:#15803d}.RUNNING{color:#1d4ed8}</style>
</head><body>
<h1>${this.escape(execution.scenario.name)}</h1>
<h2 class="${execution.status}">${execution.status}</h2>
<table>${rows.map(([key, value]) => `<tr><th>${this.escape(key)}</th><td>${this.escape(value)}</td></tr>`).join('')}</table>
<h2>Logs</h2>
<table><thead><tr><th>Status</th><th>Message</th><th>Created At</th></tr></thead><tbody>
${execution.logs.map((log) => `<tr><td class="${log.status}">${this.escape(log.status)}</td><td>${this.escape(log.message)}</td><td>${log.createdAt.toISOString()}</td></tr>`).join('')}
</tbody></table>
<p>For PDF, open this HTML export in the browser and print to PDF.</p>
</body></html>`;

    return {
      body: html,
      contentType: 'text/html; charset=utf-8',
      filename: `execution-${execution.id}.${format === 'pdf' ? 'html' : 'html'}`,
    };
  }

  private csv(value: string) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  private escape(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
}

