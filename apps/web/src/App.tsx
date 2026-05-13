import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { ExecutionDetailPage } from './pages/ExecutionDetailPage';
import { ExecutionsPage } from './pages/ExecutionsPage';
import { LocatorsPage } from './pages/LocatorsPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { ScenarioBuilderPage } from './pages/ScenarioBuilderPage';
import { TestDataPage } from './pages/TestDataPage';
import { TestFilesPage } from './pages/TestFilesPage';
import { UsersPage } from './pages/UsersPage';
import { useAuth } from './state/AuthProvider';

export function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/locators" element={<LocatorsPage />} />
        <Route path="/test-data" element={<TestDataPage />} />
        <Route path="/files" element={<TestFilesPage />} />
        <Route path="/scenarios" element={<ScenarioBuilderPage />} />
        <Route path="/executions" element={<ExecutionsPage />} />
        <Route path="/executions/:id" element={<ExecutionDetailPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
