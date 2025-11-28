import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { colors, shadows } from '../../design-tokens';

interface PremiumAppBarProps {
  title: string;
  onMenuClick?: () => void;
  user?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onSignOut?: () => void;
}

const PremiumAppBar: React.FC<PremiumAppBarProps> = ({
  title,
  onMenuClick,
  user,
  onSignOut,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    onSignOut?.();
    handleProfileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#FFFFFF',
        color: colors.neutral[900],
        boxShadow: shadows.xs,
        borderBottom: `1px solid ${colors.neutral[200]}`,
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 } as any,
          px: { xs: 2, md: 4 },
        }}
      >
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{
              mr: 2,
              color: colors.neutral[700],
              '&:hover': {
                backgroundColor: colors.neutral[50],
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            color: colors.neutral[900],
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>

        {user && (
          <>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                ml: 2,
                '&:hover': {
                  backgroundColor: colors.neutral[50],
                },
              }}
            >
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                sx={{
                  width: 36,
                  height: 36,
                  border: `2px solid ${colors.neutral[200]}`,
                }}
              >
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: '12px',
                  boxShadow: shadows.lg,
                  border: `1px solid ${colors.neutral[200]}`,
                },
              }}
            >
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: colors.error[500] }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sign Out"
                  primaryTypographyProps={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
    );
};

export default PremiumAppBar;

