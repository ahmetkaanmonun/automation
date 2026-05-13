import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Button, Card, CardContent, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

type Project = {
  id: string;
  name: string;
  modules: Array<{ id: string; name: string }>;
};

type TestFile = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  module?: { name: string };
  scenario?: { name: string };
};

type Scenario = {
  id: string;
  name: string;
  moduleId: string;
};

export function TestFilesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [files, setFiles] = useState<TestFile[] | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ projectId: '', moduleId: '', scenarioId: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === form.projectId),
    [form.projectId, projects],
  );

  async function load() {
    const [projectResponse, fileResponse, scenarioResponse] = await Promise.all([api.get('/projects'), api.get('/test-files'), api.get('/scenarios')]);
    setProjects(projectResponse.data);
    setFiles(fileResponse.data);
    setScenarios(scenarioResponse.data);
    setForm((current) => ({
      ...current,
      projectId: current.projectId || projectResponse.data[0]?.id || '',
      moduleId: current.moduleId || projectResponse.data[0]?.modules?.[0]?.id || '',
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedFile || !form.projectId) {
      setError('Project and file are required.');
      return;
    }

    const body = new FormData();
    body.append('file', selectedFile);
    await api.post('/test-files/upload', body, {
      params: { projectId: form.projectId, moduleId: form.moduleId || undefined, scenarioId: form.scenarioId || undefined },
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setSelectedFile(null);
    setMessage('File uploaded.');
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  if (!files) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Test Files</Typography>
      <Card component="form" onSubmit={submit}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Upload File</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {message && (
              <Alert severity="success" onClose={() => setMessage('')}>
                {message}
              </Alert>
            )}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  label="Project"
                  select
                  value={form.projectId}
                  onChange={(event) =>
                    setForm({
                      projectId: event.target.value,
                      moduleId: projects.find((project) => project.id === event.target.value)?.modules?.[0]?.id || '',
                      scenarioId: '',
                    })
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
              <Grid item xs={12} md={4}>
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
                  label="Scenario"
                  select
                  value={form.scenarioId}
                  onChange={(event) => setForm((current) => ({ ...current, scenarioId: event.target.value }))}
                  fullWidth
                >
                  <MenuItem value="">No scenario</MenuItem>
                  {scenarios
                    .filter((scenario) => !form.moduleId || scenario.moduleId === form.moduleId)
                    .map((scenario) => (
                      <MenuItem key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button component="label" variant="outlined" fullWidth>
                  Choose File
                  <input hidden type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button type="submit" startIcon={<CloudUploadIcon />} variant="contained" fullWidth>
                  Upload
                </Button>
              </Grid>
              {selectedFile && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">{selectedFile.name}</Typography>
                </Grid>
              )}
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {files.map((file) => (
          <Grid item xs={12} md={4} key={file.id}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6">{file.originalName}</Typography>
                  <Typography color="text.secondary">{file.mimeType || 'unknown'} / {Math.ceil(file.size / 1024)} KB</Typography>
                  <Stack direction="row" spacing={1}>
                    {file.module?.name && <Chip size="small" label={file.module.name} />}
                    {file.scenario?.name && <Chip size="small" variant="outlined" label={file.scenario.name} />}
                  </Stack>
                  <Button startIcon={<DownloadIcon />} href={`/api/test-files/${file.id}/download`} target="_blank">
                    Download
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
