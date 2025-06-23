
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = true,
  size = 'md',
  color = 'default',
  animated = false
}) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const colorClasses = {
    default: '',
    success: '[&>div]:bg-green-500',
    warning: '[&>div]:bg-yellow-500',
    error: '[&>div]:bg-red-500'
  };

  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      )}
      <Progress
        value={clampedPercentage}
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          ${animated ? 'transition-all duration-500 ease-out' : ''}
        `}
      />
    </div>
  );
};

export default ProgressBar;
