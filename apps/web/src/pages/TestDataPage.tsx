import AddIcon from '@mui/icons-material/Add';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

type TestData = {
  id: string;
  key: string;
  value: string;
  environment: string;
  isSecret: boolean;
  module?: { name: string };
};

type Project = {
  id: string;
  name: string;
  modules: Array<{ id: string; name: string }>;
};

const environments = ['DEV', 'TEST', 'PREPROD', 'PROD_LIKE'];

export function TestDataPage() {
  const [items, setItems] = useState<TestData[] | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    moduleId: '',
    environment: 'TEST',
    key: '',
    value: '',
    isSecret: false,
    description: '',
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === form.projectId),
    [form.projectId, projects],
  );

  async function load() {
    const [testDataResponse, projectsResponse] = await Promise.all([api.get('/test-data'), api.get('/projects')]);
    setItems(testDataResponse.data);
    setProjects(projectsResponse.data);
    setForm((current) => ({
      ...current,
      projectId: current.projectId || projectsResponse.data[0]?.id || '',
      moduleId: current.moduleId || projectsResponse.data[0]?.modules?.[0]?.id || '',
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.projectId || !form.key.trim() || !form.value) {
      setError('Project, key and value are required.');
      return;
    }

    await api.post('/test-data', {
      projectId: form.projectId,
      moduleId: form.moduleId || undefined,
      environment: form.environment,
      key: form.key.trim(),
      value: form.value,
      isSecret: form.isSecret,
      description: form.description || undefined,
    });

    setForm((current) => ({ ...current, key: '', value: '', description: '', isSecret: false }));
    setMessage('Test data created.');
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  if (!items) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Test Data</Typography>
      <Card component="form" onSubmit={submit}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Create Test Data</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Project"
                  select
                  value={form.projectId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      projectId: event.target.value,
                      moduleId: projects.find((project) => project.id === event.target.value)?.modules?.[0]?.id || '',
                    }))
                  }
                  fullWidth
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Module"
                  select
                  value={form.moduleId}
                  onChange={(event) => setForm((current) => ({ ...current, moduleId: event.target.value }))}
                  fullWidth
                >
                  <MenuItem value="">Project level</MenuItem>
                  {(selectedProject?.modules ?? []).map((module) => (
                    <MenuItem key={module.id} value={module.id}>
                      {module.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Environment"
                  select
                  value={form.environment}
                  onChange={(event) => setForm((current) => ({ ...current, environment: event.target.value }))}
                  fullWidth
                >
                  {environments.map((environment) => (
                    <MenuItem key={environment} value={environment}>
                      {environment}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Key"
                  value={form.key}
                  onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Value"
                  type={form.isSecret ? 'password' : 'text'}
                  value={form.value}
                  onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Description"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.isSecret}
                      onChange={(event) => setForm((current) => ({ ...current, isSecret: event.target.checked }))}
                    />
                  }
                  label="Secret"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth sx={{ height: '100%' }}>
                  Create
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{item.key}</Typography>
                  {item.isSecret && <VisibilityOffIcon fontSize="small" />}
                </Stack>
                <Typography color="text.secondary">{item.value}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip size="small" label={item.environment} />
                  {item.module?.name && <Chip size="small" variant="outlined" label={item.module.name} />}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
