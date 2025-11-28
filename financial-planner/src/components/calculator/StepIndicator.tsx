import React from 'react';
import { Box, Typography } from '@mui/material';
import { Check } from '@mui/icons-material';
import { colors, transitions } from '../../design-tokens';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  return (
    <Box sx={{ mb: 6 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '20px',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: colors.neutral[200],
            zIndex: 0,
          },
        }}
      >
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <Box
              key={stepNumber}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted
                    ? colors.success[500]
                    : isCurrent
                    ? colors.primary[500]
                    : colors.neutral[200],
                  color: isCompleted || isCurrent ? '#FFFFFF' : colors.neutral[500],
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: transitions.base,
                  mb: 1,
                }}
              >
                {isCompleted ? (
                  <Check sx={{ fontSize: 20 }} />
                ) : (
                  stepNumber
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? colors.primary[500] : colors.neutral[500],
                  textAlign: 'center',
                  maxWidth: 100,
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default StepIndicator;

