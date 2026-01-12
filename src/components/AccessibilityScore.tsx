import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AccessibilityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function AccessibilityScore({ score, size = 'md', showLabel = true }: AccessibilityScoreProps) {
  const dimensions = {
    sm: { size: 80, stroke: 6, fontSize: 'text-lg' },
    md: { size: 140, stroke: 10, fontSize: 'text-3xl' },
    lg: { size: 200, stroke: 14, fontSize: 'text-5xl' },
  };

  const { size: svgSize, stroke, fontSize } = dimensions[size];
  const radius = (svgSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor = useMemo(() => {
    if (score >= 90) return 'hsl(var(--score-excellent))';
    if (score >= 70) return 'hsl(var(--score-good))';
    if (score >= 50) return 'hsl(var(--score-moderate))';
    return 'hsl(var(--score-poor))';
  }, [score]);

  const scoreLabel = useMemo(() => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Score circle */}
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={scoreColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={`font-bold ${fontSize}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ color: scoreColor }}
          >
            {score}
          </motion.span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              out of 100
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <motion.span 
          className="text-sm font-medium"
          style={{ color: scoreColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {scoreLabel}
        </motion.span>
      )}
    </div>
  );
}
