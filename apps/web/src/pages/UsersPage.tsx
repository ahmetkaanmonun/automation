import AddIcon from '@mui/icons-material/Add';
import { Alert, Button, Card, CardContent, Chip, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
};

const roles = ['ADMIN', 'TESTER', 'VIEWER'];

export function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ email: '', fullName: '', role: 'TESTER', password: 'Temp12345!' });

  async function load() {
    const response = await api.get('/users');
    setUsers(response.data);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.email || !form.fullName || !form.password) return;
    await api.post('/users', form);
    setForm({ email: '', fullName: '', role: 'TESTER', password: 'Temp12345!' });
    setMessage('User created.');
    await load();
  }

  async function changeRole(user: User, role: string) {
    await api.patch(`/users/${user.id}`, { role });
    await load();
  }

  async function toggleActive(user: User) {
    await api.patch(`/users/${user.id}`, { active: !user.active });
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  if (!users) return <LinearProgress />;

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Users and Roles</Typography>
      <Card component="form" onSubmit={submit}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">Create User</Typography>
            {message && <Alert severity="success" onClose={() => setMessage('')}>{message}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Full name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="Role" select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} fullWidth>
                  {roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button type="submit" startIcon={<AddIcon />} variant="contained" fullWidth sx={{ height: '100%' }}>Create</Button>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {users.map((user) => (
          <Grid item xs={12} md={4} key={user.id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">{user.fullName}</Typography>
                  <Typography color="text.secondary">{user.email}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={user.role} />
                    <Chip color={user.active ? 'success' : 'default'} label={user.active ? 'Active' : 'Inactive'} />
                  </Stack>
                  <TextField label="Role" select size="small" value={user.role} onChange={(event) => changeRole(user, event.target.value)}>
                    {roles.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                  </TextField>
                  <Button variant="outlined" onClick={() => toggleActive(user)}>{user.active ? 'Disable' : 'Enable'}</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

