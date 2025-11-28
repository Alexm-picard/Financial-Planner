import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { colors, transitions, shadows } from '../../design-tokens';

const DRAWER_WIDTH = 280;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Accounts', icon: <AccountBalanceIcon />, path: '/accounts' },
  { text: 'Transactions', icon: <HistoryIcon />, path: '/transactions' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
  { text: 'Cost Calculator', icon: <CalculateIcon />, path: '/cost-calculator' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

interface PremiumSidebarProps {
  user?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onSignOut?: () => void;
}

const PremiumSidebar: React.FC<PremiumSidebarProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: `1px solid ${colors.neutral[200]}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        boxShadow: shadows.sm,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
          color: '#FFFFFF',
          minHeight: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Financial Planner
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.9,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Manage Your Wealth
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2, px: 2 }}>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.text}
                onClick={() => navigate(item.path)}
                disablePadding
                sx={{
                  mb: 0.5,
                  cursor: 'pointer',
                  borderRadius: '12px',
                  backgroundColor: isActive ? colors.primary[50] : 'transparent',
                  position: 'relative',
                  transition: transitions.base,
                  '&::before': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '60%',
                        backgroundColor: colors.primary[500],
                        borderRadius: '0 4px 4px 0',
                      }
                    : {},
                  '&:hover': {
                    backgroundColor: isActive ? colors.primary[50] : colors.neutral[50],
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 48,
                    color: isActive ? colors.primary[500] : colors.neutral[500],
                    transition: transitions.base,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9375rem',
                    color: isActive ? colors.primary[500] : colors.neutral[700],
                    sx: {
                      transition: transitions.base,
                    },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile Section */}
      {user && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              borderRadius: '12px',
              mx: 2,
              mb: 2,
              transition: transitions.base,
              '&:hover': {
                backgroundColor: colors.neutral[50],
              },
            }}
            onClick={onSignOut}
          >
            <Avatar
              src={user.photoURL || undefined}
              alt={user.displayName || 'User'}
              sx={{
                width: 40,
                height: 40,
                border: `2px solid ${colors.neutral[200]}`,
              }}
            >
              {user.displayName?.[0] || user.email?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: colors.neutral[900],
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.displayName || 'User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.neutral[500],
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PremiumSidebar;
export { DRAWER_WIDTH };

