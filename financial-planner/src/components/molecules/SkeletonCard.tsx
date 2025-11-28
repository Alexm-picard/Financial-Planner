import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';
import { colors } from '../../design-tokens';

const SkeletonCard: React.FC = () => {
  return (
    <Card
      sx={{
        borderRadius: '20px',
        border: `1px solid ${colors.neutral[200]}`,
        backgroundColor: '#FFFFFF',
      }}
    >
      <CardContent sx={{ p: 3.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Skeleton
              variant="rectangular"
              width={56}
              height={56}
              sx={{ borderRadius: '12px' }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={20} />
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;

