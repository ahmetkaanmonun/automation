import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

type ReportExecution = {
  id: string;
  status: string;
  environment: string;
  durationMs?: number;
  errorMessage?: string;
  scenario: { name: string; module: { name: string }; project: { name: string } };
  startedBy: { fullName: string };
};

export function ReportsPage() {
  const [executions, setExecutions] = useState<ReportExecution[] | null>(null);

  async function load() {
    const response = await api.get('/reports/executions');
    setExecutions(response.data);
  }

  async function downloadReport(execution: ReportExecution, format: string) {
    const response = await api.get(`/reports/executions/${execution.id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    const href = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = href;
    link.download = `execution-${execution.id}.${format === 'excel' ? 'csv' : 'html'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  }

  useEffect(() => {
    void load();
  }, []);

  if (!executions) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Reports</Typography>
        <Button startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
      </Stack>
      {executions.map((execution) => (
        <Card key={execution.id}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Stack spacing={1}>
                <Typography variant="h6">{execution.scenario.name}</Typography>
                <Typography color="text.secondary">
                  {execution.scenario.project.name} / {execution.scenario.module.name} / {execution.environment} / {execution.startedBy.fullName}
                </Typography>
                {execution.errorMessage && <Typography color="error">{execution.errorMessage}</Typography>}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={execution.status} className={`status-${execution.status}`} />
                <Button startIcon={<FileDownloadIcon />} onClick={() => downloadReport(execution, 'html')}>HTML</Button>
                <Button startIcon={<FileDownloadIcon />} onClick={() => downloadReport(execution, 'excel')}>Excel</Button>
                <Button startIcon={<FileDownloadIcon />} onClick={() => downloadReport(execution, 'pdf')}>PDF</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
