import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Button, Card, CardContent, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../state/AuthProvider';

type Scenario = {
  id: string;
  name: string;
  environment: string;
  module: { name: string };
};

type Schedule = {
  id: string;
  environment: string;
  scheduleType: 'INTERVAL' | 'DAILY';
  intervalMinutes?: number | null;
  timeOfDay?: string | null;
  nextRunAt: string;
  lastRunAt?: string | null;
  active: boolean;
  scenario: { name: string; module: { name: string }; project: { name: string } };
  createdBy: { fullName: string; email: string };
};

const environments = ['DEV', 'TEST', 'PREPROD', 'PROD_LIKE'];

export function SchedulesPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    scenarioId: '',
    environment: 'TEST',
    scheduleType: 'INTERVAL',
    intervalMinutes: '60',
    timeOfDay: '09:00',
  });

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === form.scenarioId),
    [form.scenarioId, scenarios],
  );
  const canManage = user?.role === 'ADMIN' || user?.role === 'TESTER';
  const canDelete = user?.role === 'ADMIN';

  async function load() {
    const [scheduleResponse, scenarioResponse] = await Promise.all([api.get('/schedules'), api.get('/scenarios')]);
    setSchedules(scheduleResponse.data);
    setScenarios(scenarioResponse.data);
    setForm((current) => ({
      ...current,
      scenarioId: current.scenarioId || scenarioResponse.data[0]?.id || '',
      environment: current.environment || scenarioResponse.data[0]?.environment || 'TEST',
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.scenarioId) return;

    await api.post('/schedules', {
      scenarioId: form.scenarioId,
      environment: form.environment,
      scheduleType: form.scheduleType,
      intervalMinutes: form.scheduleType === 'INTERVAL' ? Number(form.intervalMinutes) : undefined,
      timeOfDay: form.scheduleType === 'DAILY' ? form.timeOfDay : undefined,
    });
    setMessage('Schedule created.');
    await load();
  }

  async function toggle(schedule: Schedule) {
    await api.patch(`/schedules/${schedule.id}`, { active: !schedule.active });
    await load();
  }

  async function remove(schedule: Schedule) {
    const confirmed = window.confirm(`Delete schedule for "${schedule.scenario.name}"?`);
    if (!confirmed) return;
    await api.delete(`/schedules/${schedule.id}`);
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  if (!schedules) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Scheduled Executions</Typography>
        <Button startIcon={<RefreshIcon />} onClick={load}>
          Refresh
        </Button>
      </Stack>

      {canManage ? (
        <Card component="form" onSubmit={submit}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Create Schedule</Typography>
              {message && (
                <Alert severity="success" onClose={() => setMessage('')}>
                  {message}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Scenario"
                    select
                    value={form.scenarioId}
                    onChange={(event) => {
                      const scenario = scenarios.find((item) => item.id === event.target.value);
                      setForm((current) => ({
                        ...current,
                        scenarioId: event.target.value,
                        environment: scenario?.environment ?? current.environment,
                      }));
                    }}
                    fullWidth
                  >
                    {scenarios.map((scenario) => (
                      <MenuItem key={scenario.id} value={scenario.id}>
                        {scenario.name} / {scenario.module.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField label="Environment" select value={form.environment} onChange={(event) => setForm((current) => ({ ...current, environment: event.target.value }))} fullWidth>
                    {environments.map((environment) => (
                      <MenuItem key={environment} value={environment}>
                        {environment}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField label="Type" select value={form.scheduleType} onChange={(event) => setForm((current) => ({ ...current, scheduleType: event.target.value }))} fullWidth>
                    <MenuItem value="INTERVAL">Interval</MenuItem>
                    <MenuItem value="DAILY">Daily</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  {form.scheduleType === 'INTERVAL' ? (
                    <TextField label="Minutes" value={form.intervalMinutes} onChange={(event) => setForm((current) => ({ ...current, intervalMinutes: event.target.value }))} fullWidth />
                  ) : (
                    <TextField label="Time" type="time" value={form.timeOfDay} onChange={(event) => setForm((current) => ({ ...current, timeOfDay: event.target.value }))} fullWidth />
                  )}
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button type="submit" startIcon={<AddIcon />} variant="contained" fullWidth sx={{ height: '100%' }}>
                    Schedule
                  </Button>
                </Grid>
                {selectedScenario && (
                  <Grid item xs={12}>
                    <Typography color="text.secondary">Selected: {selectedScenario.name} / {selectedScenario.module.name}</Typography>
                  </Grid>
                )}
              </Grid>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">Viewer users can monitor scheduled executions but cannot create or change them.</Alert>
      )}

      <Grid container spacing={2}>
        {schedules.map((schedule) => (
          <Grid item xs={12} md={6} key={schedule.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{schedule.scenario.name}</Typography>
                    <Chip color={schedule.active ? 'success' : 'default'} label={schedule.active ? 'Active' : 'Paused'} />
                  </Stack>
                  <Typography color="text.secondary">
                    {schedule.scenario.project.name} / {schedule.scenario.module.name} / {schedule.environment}
                  </Typography>
                  <Typography>
                    {schedule.scheduleType === 'INTERVAL'
                      ? `Every ${schedule.intervalMinutes} minutes`
                      : `Daily at ${schedule.timeOfDay}`}
                  </Typography>
                  <Typography color="text.secondary">Next run: {new Date(schedule.nextRunAt).toLocaleString()}</Typography>
                  <Typography color="text.secondary">
                    Last run: {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : '-'}
                  </Typography>
                  <Typography color="text.secondary">Owner: {schedule.createdBy.fullName}</Typography>
                  <Stack direction="row" spacing={1}>
                    {canManage && (
                      <Button variant="outlined" onClick={() => toggle(schedule)}>
                        {schedule.active ? 'Pause' : 'Activate'}
                      </Button>
                    )}
                    {canDelete && (
                      <Button color="error" startIcon={<DeleteIcon />} onClick={() => remove(schedule)}>
                        Delete
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
