import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

type Execution = {
  id: string;
  status: string;
  durationMs?: number;
  errorMessage?: string;
  scenario: { name: string; module: { name: string } };
  startedBy: { fullName: string; email: string };
};

export function ExecutionsPage() {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<Execution[] | null>(null);

  async function load() {
    const response = await api.get('/executions');
    setExecutions(response.data);
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, []);

  if (!executions) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Execution Center</Typography>
        <Button startIcon={<RefreshIcon />} onClick={load}>
          Refresh
        </Button>
      </Stack>
      {executions.map((execution) => (
        <Card key={execution.id}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Stack>
                <Typography variant="h6">{execution.scenario.name}</Typography>
                <Typography color="text.secondary">
                  {execution.scenario.module.name} / started by {execution.startedBy.fullName}
                </Typography>
                {execution.errorMessage && <Typography color="error">{execution.errorMessage}</Typography>}
              </Stack>
              <Typography variant="h6" className={`status-${execution.status}`}>
                {execution.status}
              </Typography>
              <Button startIcon={<VisibilityIcon />} onClick={() => navigate(`/executions/${execution.id}`)}>
                Details
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
