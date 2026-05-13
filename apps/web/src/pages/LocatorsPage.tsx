import AddIcon from '@mui/icons-material/Add';
import { Alert, Button, Card, CardContent, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

type Project = { id: string; name: string; modules: Array<{ id: string; name: string }> };
type Locator = {
  id: string;
  name: string;
  type: string;
  value: string;
  page?: string;
  description?: string;
  moduleId: string;
  module: { name: string };
};

const locatorTypes = ['ID', 'XPATH', 'CSS_SELECTOR', 'CLASS_NAME', 'NAME', 'TAG_NAME'];

export function LocatorsPage() {
  const [locators, setLocators] = useState<Locator[] | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('CSS_SELECTOR');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    moduleId: '',
    name: '',
    description: '',
    type: 'CSS_SELECTOR',
    value: '',
    page: '',
  });

  const selectedProject = useMemo(() => projects.find((project) => project.id === form.projectId), [form.projectId, projects]);

  async function load() {
    const [locatorResponse, projectResponse] = await Promise.all([
      api.get('/locators', { params: { q: q || undefined } }),
      api.get('/projects'),
    ]);
    setLocators(locatorResponse.data);
    setProjects(projectResponse.data);
    setForm((current) => ({
      ...current,
      projectId: current.projectId || projectResponse.data[0]?.id || '',
      moduleId: current.moduleId || projectResponse.data[0]?.modules?.[0]?.id || '',
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.projectId || !form.moduleId || !form.name.trim() || !form.value.trim()) return;
    await api.post('/locators', {
      projectId: form.projectId,
      moduleId: form.moduleId,
      name: form.name.trim(),
      description: form.description || undefined,
      type: form.type,
      value: form.value.trim(),
      page: form.page || undefined,
    });
    setForm((current) => ({ ...current, name: '', description: '', value: '', page: '' }));
    setMessage('Locator created.');
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  if (!locators) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Locator Management</Typography>
      <Card component="form" onSubmit={submit}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Create Locator</Typography>
            {message && <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="Project" select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value, moduleId: projects.find((project) => project.id === event.target.value)?.modules?.[0]?.id || '' }))} fullWidth>
                  {projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Module" select value={form.moduleId} onChange={(event) => setForm((current) => ({ ...current, moduleId: event.target.value }))} fullWidth>
                  {(selectedProject?.modules ?? []).map((module) => <MenuItem key={module.id} value={module.id}>{module.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Type" select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} fullWidth>
                  {locatorTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField label="Value" value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Page" value={form.page} onChange={(event) => setForm((current) => ({ ...current, page: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button type="submit" variant="contained" startIcon={<AddIcon />} fullWidth sx={{ height: '100%' }}>Create</Button>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
        <TextField label="Search locator" value={q} onChange={(event) => setQ(event.target.value)} size="small" />
        <TextField label="Type" select value={type} onChange={(event) => setType(event.target.value)} size="small" sx={{ minWidth: 180 }}>
          {locatorTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
        <Button variant="outlined" onClick={load}>Filter</Button>
      </Stack>
      <Grid container spacing={2}>
        {locators.map((locator) => (
          <Grid item xs={12} md={6} lg={4} key={locator.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{locator.name}</Typography>
                <Typography color="text.secondary">{locator.module?.name}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{locator.type}: {locator.value}</Typography>
                <Typography variant="caption">{locator.page}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

