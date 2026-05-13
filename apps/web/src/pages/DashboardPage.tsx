import { Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../api/client';

type Summary = {
  scenarioCount: number;
  locatorCount: number;
  successRate: number;
  failureRate: number;
  recentExecutions: Array<{ id: string; status: string; scenario: { name: string; module: { name: string } } }>;
  modules: Array<{ id: string; name: string; _count: { scenarios: number; locators: number } }>;
};

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((response) => setSummary(response.data));
  }, []);

  if (!summary) {
    return <LinearProgress />;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Dashboard</Typography>
      <Grid container spacing={2}>
        <Metric title="Total Scenarios" value={summary.scenarioCount} />
        <Metric title="Total Locators" value={summary.locatorCount} />
        <Metric title="Pass Rate" value={`${summary.successRate}%`} />
        <Metric title="Fail Rate" value={`${summary.failureRate}%`} />
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Executions
              </Typography>
              <Stack spacing={1}>
                {summary.recentExecutions.map((execution) => (
                  <Typography key={execution.id} className={`status-${execution.status}`}>
                    {execution.scenario.name} / {execution.scenario.module.name} / {execution.status}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Module Status
              </Typography>
              <Stack spacing={1}>
                {summary.modules.map((module) => (
                  <Typography key={module.id}>
                    {module.name}: {module._count.scenarios} scenarios, {module._count.locators} locators
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

function Metric({ title, value }: { title: string; value: number | string }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent>
          <Typography color="text.secondary">{title}</Typography>
          <Typography variant="h4">{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

