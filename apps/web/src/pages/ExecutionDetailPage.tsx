import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

type ExecutionLog = {
  id: string;
  status: string;
  message: string;
  metadata?: { screenshotPath?: string };
  createdAt: string;
};

type ExecutionDetail = {
  id: string;
  status: string;
  environment: string;
  durationMs?: number;
  errorMessage?: string;
  screenshotPath?: string;
  scenario: {
    name: string;
    module: { name: string };
    steps: Array<{ id: string; orderIndex: number; name: string; action: string }>;
  };
  logs: ExecutionLog[];
  startedBy: { fullName: string; email: string };
};

export function ExecutionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<ExecutionDetail | null>(null);

  async function load() {
    if (!id) return;
    const response = await api.get(`/executions/${id}`);
    setExecution(response.data);
  }

  const screenshotPath = useMemo(() => {
    const fromExecution = execution?.screenshotPath;
    const fromLog = execution?.logs.find((log) => log.metadata?.screenshotPath)?.metadata?.screenshotPath;
    return fromExecution || fromLog;
  }, [execution]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(load, 2500);
    return () => window.clearInterval(timer);
  }, [id]);

  if (!execution) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Stack spacing={1}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/executions')} sx={{ alignSelf: 'flex-start' }}>
            Back
          </Button>
          <Typography variant="h4">{execution.scenario.name}</Typography>
          <Typography color="text.secondary">
            {execution.scenario.module.name} / {execution.environment} / started by {execution.startedBy.fullName}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={execution.status} className={`status-${execution.status}`} />
          <Button startIcon={<RefreshIcon />} onClick={load}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      {execution.errorMessage && (
        <Card>
          <CardContent>
            <Typography variant="h6" color="error">
              Error
            </Typography>
            <Typography color="error">{execution.errorMessage}</Typography>
          </CardContent>
        </Card>
      )}

      {screenshotPath && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Failure Screenshot
            </Typography>
            <Box
              component="img"
              src={screenshotPath}
              alt="Failure screenshot"
              sx={{ width: '100%', maxHeight: 620, objectFit: 'contain', border: '1px solid #dbe3ef' }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Live Logs
          </Typography>
          <Stack spacing={1}>
            {execution.logs.map((log) => (
              <Box key={log.id} sx={{ borderBottom: '1px solid #edf1f7', py: 1 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
                  <Typography className={`status-${log.status}`}>{log.status}</Typography>
                  <Typography color="text.secondary">{new Date(log.createdAt).toLocaleString()}</Typography>
                </Stack>
                <Typography>{log.message}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
