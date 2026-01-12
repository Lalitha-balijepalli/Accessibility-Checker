import { Button } from '@/components/ui/button';
import { Severity, WCAGLevel } from '@/types/accessibility';
import { cn } from '@/lib/utils';

interface IssueFiltersProps {
  selectedSeverity: Severity | 'all';
  selectedLevel: WCAGLevel | 'all';
  onSeverityChange: (severity: Severity | 'all') => void;
  onLevelChange: (level: WCAGLevel | 'all') => void;
}

export function IssueFilters({
  selectedSeverity,
  selectedLevel,
  onSeverityChange,
  onLevelChange,
}: IssueFiltersProps) {
  const severities: (Severity | 'all')[] = ['all', 'critical', 'moderate', 'minor'];
  const levels: (WCAGLevel | 'all')[] = ['all', 'A', 'AA', 'AAA'];

  return (
    <div className="flex flex-wrap gap-4">
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Severity
        </span>
        <div className="flex gap-1">
          {severities.map((severity) => (
            <Button
              key={severity}
              variant={selectedSeverity === severity ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSeverityChange(severity)}
              className={cn(
                'capitalize',
                selectedSeverity === severity && 'gradient-hero'
              )}
            >
              {severity}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          WCAG Level
        </span>
        <div className="flex gap-1">
          {levels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLevelChange(level)}
              className={cn(
                selectedLevel === level && 'gradient-hero'
              )}
            >
              {level === 'all' ? 'All' : level}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
