import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  showDot?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'subtle';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  showDot = true,
  className = '',
  size = 'md',
  variant = 'subtle',
}) => {
  const config = {
    critical: {
      label: 'Critical',
      subtle: 'bg-red-50 text-red-700 border-red-200',
      solid: 'bg-red-600 text-white border-transparent',
      dot: 'bg-red-600',
    },
    high: {
      label: 'High Risk',
      subtle: 'bg-orange-50 text-orange-700 border-orange-200',
      solid: 'bg-orange-500 text-white border-transparent',
      dot: 'bg-orange-500',
    },
    moderate: {
      label: 'Moderate',
      subtle: 'bg-amber-50 text-amber-800 border-amber-200',
      solid: 'bg-amber-500 text-slate-950 border-transparent',
      dot: 'bg-amber-500',
    },
    low: {
      label: 'Low Risk',
      subtle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      solid: 'bg-emerald-600 text-white border-transparent',
      dot: 'bg-emerald-600',
    },
    insufficient_data: {
      label: 'Insufficient Data',
      subtle: 'bg-slate-100 text-slate-700 border-slate-300',
      solid: 'bg-slate-600 text-white border-transparent',
      dot: 'bg-slate-400',
    },
  }[level] || {
    label: 'Unknown',
    subtle: 'bg-slate-100 text-slate-600 border-slate-200',
    solid: 'bg-slate-500 text-white border-transparent',
    dot: 'bg-slate-400',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1 font-bold',
  }[size];

  const colorClass = variant === 'solid' ? config.solid : config.subtle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold tracking-wide ${colorClass} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'solid' ? 'bg-white' : config.dot
          }`}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
