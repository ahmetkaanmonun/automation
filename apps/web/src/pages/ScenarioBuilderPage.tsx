import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

type Scenario = {
  id: string;
  projectId: string;
  moduleId: string;
  name: string;
  description?: string;
  environment: string;
  tags: string[];
  module: { name: string };
  steps: Array<{
    id: string;
    orderIndex: number;
    name: string;
    action: string;
    locatorId?: string | null;
    testDataId?: string | null;
    inputValue?: string | null;
    expectedValue?: string | null;
    timeoutMs?: number | null;
  }>;
};

type Project = {
  id: string;
  name: string;
  modules: Array<{ id: string; name: string }>;
};

type Locator = {
  id: string;
  name: string;
  moduleId: string;
};

type TestData = {
  id: string;
  key: string;
  moduleId?: string | null;
  environment: string;
};

type TestFile = {
  id: string;
  originalName: string;
  moduleId?: string | null;
  path: string;
};

type StepForm = {
  name: string;
  action: string;
  locatorId: string;
  testDataId: string;
  inputValue: string;
  expectedValue: string;
  timeoutMs: string;
};

const environments = ['DEV', 'TEST', 'PREPROD', 'PROD_LIKE'];
const actions = [
  'OPEN_URL',
  'CLICK',
  'DOUBLE_CLICK',
  'RIGHT_CLICK',
  'INPUT_TEXT',
  'CLEAR_INPUT',
  'SELECT_DROPDOWN',
  'UPLOAD_FILE',
  'WAIT',
  'WAIT_VISIBLE',
  'WAIT_CLICKABLE',
  'ASSERT_VISIBLE',
  'ASSERT_TEXT',
  'ASSERT_VALUE',
  'ASSERT_URL',
  'TAKE_SCREENSHOT',
  'SCROLL',
  'HOVER',
  'API_REQUEST',
  'CUSTOM_SCRIPT',
];

const emptyStep: StepForm = {
  name: '',
  action: 'OPEN_URL',
  locatorId: '',
  testDataId: '',
  inputValue: '',
  expectedValue: '',
  timeoutMs: '10000',
};

export function ScenarioBuilderPage() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [locators, setLocators] = useState<Locator[]>([]);
  const [testData, setTestData] = useState<TestData[]>([]);
  const [testFiles, setTestFiles] = useState<TestFile[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    editingId: '',
    projectId: '',
    moduleId: '',
    environment: 'TEST',
    name: '',
    description: '',
    tags: '',
    steps: [{ ...emptyStep }],
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === form.projectId),
    [form.projectId, projects],
  );

  const moduleLocators = locators.filter((locator) => locator.moduleId === form.moduleId);
  const moduleTestData = testData.filter(
    (item) => item.environment === form.environment && (!item.moduleId || item.moduleId === form.moduleId),
  );
  const moduleTestFiles = testFiles.filter((file) => !file.moduleId || file.moduleId === form.moduleId);

  async function load() {
    const [scenarioResponse, projectResponse, locatorResponse, testDataResponse, testFileResponse] = await Promise.all([
      api.get('/scenarios'),
      api.get('/projects'),
      api.get('/locators'),
      api.get('/test-data'),
      api.get('/test-files'),
    ]);

    setScenarios(scenarioResponse.data);
    setProjects(projectResponse.data);
    setLocators(locatorResponse.data);
    setTestData(testDataResponse.data);
    setTestFiles(testFileResponse.data);
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

    const validSteps = form.steps.filter((step) => step.name.trim() && step.action);
    if (!form.projectId || !form.moduleId || !form.name.trim() || validSteps.length === 0) {
      setError('Project, module, scenario name and at least one step are required.');
      return;
    }

    const payload = {
      projectId: form.projectId,
      moduleId: form.moduleId,
      environment: form.environment,
      name: form.name.trim(),
      description: form.description || undefined,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      steps: validSteps.map((step, index) => ({
        orderIndex: index + 1,
        name: step.name.trim(),
        action: step.action,
        locatorId: step.locatorId || undefined,
        testDataId: step.testDataId || undefined,
        inputValue: step.inputValue || undefined,
        expectedValue: step.expectedValue || undefined,
        timeoutMs: Number(step.timeoutMs || 10000),
      })),
    };

    if (form.editingId) {
      await api.patch(`/scenarios/${form.editingId}`, payload);
    } else {
      await api.post('/scenarios', payload);
    }

    setForm((current) => ({ ...current, editingId: '', name: '', description: '', tags: '', steps: [{ ...emptyStep }] }));
    setMessage(form.editingId ? 'Scenario updated.' : 'Scenario created.');
    await load();
  }

  async function start(scenario: Scenario) {
    const response = await api.post('/executions', { scenarioId: scenario.id, environment: scenario.environment });
    navigate(`/executions/${response.data.id}`);
  }

  async function clone(id: string) {
    await api.post(`/scenarios/${id}/clone`);
    setMessage('Scenario cloned.');
    await load();
  }

  async function remove(scenario: Scenario) {
    const confirmed = window.confirm(`Delete scenario "${scenario.name}"?`);
    if (!confirmed) return;

    await api.delete(`/scenarios/${scenario.id}`);
    setMessage('Scenario deleted.');
    await load();
  }

  function edit(scenario: Scenario) {
    setForm({
      editingId: scenario.id,
      projectId: scenario.projectId,
      moduleId: scenario.moduleId,
      environment: scenario.environment,
      name: scenario.name,
      description: scenario.description ?? '',
      tags: scenario.tags.join(', '),
      steps: scenario.steps
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((step) => ({
          name: step.name,
          action: step.action,
          locatorId: step.locatorId ?? '',
          testDataId: step.testDataId ?? '',
          inputValue: step.inputValue ?? '',
          expectedValue: step.expectedValue ?? '',
          timeoutMs: String(step.timeoutMs ?? 10000),
        })),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setForm((current) => ({ ...current, editingId: '', name: '', description: '', tags: '', steps: [{ ...emptyStep }] }));
  }

  function updateStep(index: number, patch: Partial<StepForm>) {
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)),
    }));
  }

  function removeStep(index: number) {
    setForm((current) => ({
      ...current,
      steps: current.steps.filter((_step, stepIndex) => stepIndex !== index),
    }));
  }

  function moveStep(from: number, to: number) {
    if (to < 0 || to >= form.steps.length) return;
    setForm((current) => {
      const next = [...current.steps];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...current, steps: next };
    });
  }

  useEffect(() => {
    void load();
  }, []);

  if (!scenarios) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Scenario Builder</Typography>

      <Card component="form" onSubmit={submit}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">{form.editingId ? 'Edit Scenario' : 'Create Scenario'}</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {message && (
              <Alert severity="success" onClose={() => setMessage('')}>
                {message}
              </Alert>
            )}
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
              <Grid item xs={12} md={4}>
                <TextField
                  label="Scenario name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
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
              <Grid item xs={12} md={4}>
                <TextField
                  label="Tags"
                  placeholder="smoke, login"
                  value={form.tags}
                  onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider />

            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Steps</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setForm((current) => ({ ...current, steps: [...current.steps, { ...emptyStep }] }))}
                >
                  Add Step
                </Button>
              </Stack>
              {form.steps.map((step, index) => (
                <Grid
                  container
                  spacing={1.5}
                  alignItems="center"
                  key={index}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) moveStep(dragIndex, index);
                    setDragIndex(null);
                  }}
                  sx={{ cursor: 'grab', border: '1px solid #edf1f7', borderRadius: 1, p: 1, ml: 0 }}
                >
                  <Grid item xs={12} md={2}>
                    <TextField label="Step name" value={step.name} onChange={(event) => updateStep(index, { name: event.target.value })} fullWidth />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField label="Action" select value={step.action} onChange={(event) => updateStep(index, { action: event.target.value })} fullWidth>
                      {actions.map((action) => (
                        <MenuItem key={action} value={action}>
                          {action}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField label="Locator" select value={step.locatorId} onChange={(event) => updateStep(index, { locatorId: event.target.value })} fullWidth>
                      <MenuItem value="">No locator</MenuItem>
                      {moduleLocators.map((locator) => (
                        <MenuItem key={locator.id} value={locator.id}>
                          {locator.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField label="Test data" select value={step.testDataId} onChange={(event) => updateStep(index, { testDataId: event.target.value })} fullWidth>
                      <MenuItem value="">Manual value</MenuItem>
                      {moduleTestData.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.key}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={1.5}>
                    {step.action === 'UPLOAD_FILE' ? (
                      <TextField
                        label="File"
                        select
                        value={step.inputValue}
                        onChange={(event) => updateStep(index, { inputValue: event.target.value })}
                        fullWidth
                      >
                        <MenuItem value="">Select file</MenuItem>
                        {moduleTestFiles.map((file) => (
                          <MenuItem key={file.id} value={file.path}>
                            {file.originalName}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField label="Input" value={step.inputValue} onChange={(event) => updateStep(index, { inputValue: event.target.value })} fullWidth />
                    )}
                  </Grid>
                  <Grid item xs={12} md={1.5}>
                    <TextField label="Expected" value={step.expectedValue} onChange={(event) => updateStep(index, { expectedValue: event.target.value })} fullWidth />
                  </Grid>
                  <Grid item xs={10} md={0.7}>
                    <TextField label="ms" value={step.timeoutMs} onChange={(event) => updateStep(index, { timeoutMs: event.target.value })} fullWidth />
                  </Grid>
                  <Grid item xs={2} md={0.3}>
                    <IconButton color="error" onClick={() => removeStep(index)} disabled={form.steps.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => moveStep(index, index - 1)} disabled={index === 0}>
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => moveStep(index, index + 1)} disabled={index === form.steps.length - 1}>
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
              ))}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}>
                {form.editingId ? 'Update Scenario' : 'Create Scenario'}
              </Button>
              {form.editingId && <Button onClick={cancelEdit}>Cancel</Button>}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {scenarios.map((scenario) => (
        <Card key={scenario.id}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Stack spacing={1}>
                <Typography variant="h6">{scenario.name}</Typography>
                <Typography color="text.secondary">
                  {scenario.module.name} / {scenario.environment} / {scenario.steps.length} steps
                </Typography>
                <Stack direction="row" spacing={1}>
                  {scenario.tags.map((tag) => (
                    <Chip size="small" key={tag} label={tag} />
                  ))}
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button startIcon={<EditIcon />} onClick={() => edit(scenario)}>
                  Edit
                </Button>
                <Button startIcon={<ContentCopyIcon />} onClick={() => clone(scenario.id)}>
                  Clone
                </Button>
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => remove(scenario)}>
                  Delete
                </Button>
                <Button startIcon={<PlayArrowIcon />} variant="contained" onClick={() => start(scenario)}>
                  Run
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
