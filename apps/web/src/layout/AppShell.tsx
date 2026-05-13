import DashboardIcon from '@mui/icons-material/Dashboard';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LogoutIcon from '@mui/icons-material/Logout';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RouteIcon from '@mui/icons-material/Route';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider';

const nav = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Projects', path: '/projects', icon: <FolderIcon /> },
  { label: 'Locators', path: '/locators', icon: <RouteIcon /> },
  { label: 'Test Data', path: '/test-data', icon: <DataObjectIcon /> },
  { label: 'Files', path: '/files', icon: <InsertDriveFileIcon /> },
  { label: 'Scenarios', path: '/scenarios', icon: <StorageIcon /> },
  { label: 'Executions', path: '/executions', icon: <PlayArrowIcon /> },
  { label: 'Schedules', path: '/schedules', icon: <ScheduleIcon /> },
  { label: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  { label: 'Users', path: '/users', icon: <PeopleIcon /> },
];

export function AppShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #dbe3ef', zIndex: 1300 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            QA Automation Platform
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
            {user?.fullName} / {user?.role}
          </Typography>
          <Button startIcon={<LogoutIcon />} onClick={logout} color="inherit">
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 244,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 244, boxSizing: 'border-box', pt: 8 },
        }}
      >
        <List>
          {nav.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                '&.active .MuiListItemIcon-root': { color: 'primary.contrastText' },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ mt: 2 }} />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, pt: 10, px: { xs: 2, md: 4 }, pb: 4 }}>
        {children}
      </Box>
    </Box>
  );
}
