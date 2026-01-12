import { WCAGLevel } from '@/types/accessibility';
import { cn } from '@/lib/utils';

interface WCAGBadgeProps {
  level: WCAGLevel;
  className?: string;
}

const levelConfig = {
  A: { className: 'wcag-badge-a' },
  AA: { className: 'wcag-badge-aa' },
  AAA: { className: 'wcag-badge-aaa' },
};

export function WCAGBadge({ level, className }: WCAGBadgeProps) {
  const config = levelConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border',
        config.className,
        className
      )}
    >
      WCAG {level}
    </span>
  );
}
