import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Severity } from '@/types/accessibility';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
  className?: string;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    className: 'severity-critical',
  },
  moderate: {
    label: 'Moderate',
    icon: AlertCircle,
    className: 'severity-moderate',
  },
  minor: {
    label: 'Minor',
    icon: Info,
    className: 'severity-minor',
  },
};

export function SeverityBadge({ severity, showIcon = true, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
