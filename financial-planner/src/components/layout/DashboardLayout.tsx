import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
  Container,
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
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useAuthState } from 'react-firebase-hooks/auth';
import PremiumSidebar, { DRAWER_WIDTH } from './PremiumSidebar';
import PremiumAppBar from './PremiumAppBar';
import PageTransition from './PageTransition';
import { colors } from '../../design-tokens';

// Menu items mapping for AppBar title
const menuItemsMap: Record<string, string> = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/transactions': 'Transactions',
  '/reports': 'Reports',
  '/calendar': 'Calendar',
  '/cost-calculator': 'Cost Calculator',
  '/settings': 'Settings',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const currentPageTitle = menuItemsMap[location.pathname] || 'Dashboard';

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
      }}
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <PremiumSidebar
          user={user || undefined}
          onSignOut={handleSignOut}
        />
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: 'none',
            boxShadow: 'none',
          },
        }}
      >
        <PremiumSidebar
          user={user || undefined}
          onSignOut={handleSignOut}
        />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PremiumAppBar
          title={currentPageTitle}
          onMenuClick={handleDrawerToggle}
          user={user || undefined}
          onSignOut={handleSignOut}
        />

        <Box
          sx={{
            flex: 1,
            mt: { xs: 8, md: 9 },
            pb: 4,
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              maxWidth: '1400px !important',
              px: { xs: 3, sm: 4, md: 6 },
              pt: { xs: 4, md: 6 },
            }}
          >
            <PageTransition>{children}</PageTransition>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
