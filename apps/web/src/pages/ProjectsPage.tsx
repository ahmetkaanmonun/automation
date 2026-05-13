import AddIcon from '@mui/icons-material/Add';
import { Button, Card, CardContent, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

type Project = { id: string; name: string; description?: string; modules: Array<{ id: string; name: string; description?: string }> };

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [moduleForm, setModuleForm] = useState({ projectId: '', name: '', description: '' });

  async function load() {
    const response = await api.get('/projects');
    setProjects(response.data);
    setModuleForm((current) => ({ ...current, projectId: current.projectId || response.data[0]?.id || '' }));
  }

  async function createProject(event: FormEvent) {
    event.preventDefault();
    if (!projectForm.name.trim()) return;
    await api.post('/projects', { name: projectForm.name.trim(), description: projectForm.description || undefined });
    setProjectForm({ name: '', description: '' });
    await load();
  }

  async function createModule(event: FormEvent) {
    event.preventDefault();
    if (!moduleForm.projectId || !moduleForm.name.trim()) return;
    await api.post('/modules', {
      projectId: moduleForm.projectId,
      name: moduleForm.name.trim(),
      description: moduleForm.description || undefined,
    });
    setModuleForm((current) => ({ ...current, name: '', description: '' }));
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  if (!projects) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Projects and Modules</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card component="form" onSubmit={createProject}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Create Project</Typography>
                <TextField label="Project name" value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} />
                <TextField label="Description" value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} />
                <Button type="submit" startIcon={<AddIcon />} variant="contained">Create Project</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card component="form" onSubmit={createModule}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Create Module</Typography>
                <TextField label="Project" select value={moduleForm.projectId} onChange={(event) => setModuleForm((current) => ({ ...current, projectId: event.target.value }))}>
                  {projects.map((project) => <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>)}
                </TextField>
                <TextField label="Module name" value={moduleForm.name} onChange={(event) => setModuleForm((current) => ({ ...current, name: event.target.value }))} />
                <TextField label="Description" value={moduleForm.description} onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))} />
                <Button type="submit" startIcon={<AddIcon />} variant="contained">Create Module</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid item xs={12} md={4} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>{project.description}</Typography>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {project.modules.map((module) => <Chip key={module.id} size="small" label={module.name} />)}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

