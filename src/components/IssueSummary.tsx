import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AccessibilityReport } from '@/types/accessibility';

interface IssueSummaryProps {
  report: AccessibilityReport;
}

export function IssueSummary({ report }: IssueSummaryProps) {
  const summaryItems = [
    {
      label: 'Critical',
      count: report.summary.critical,
      icon: AlertTriangle,
      colorClass: 'bg-critical/10 text-critical border-critical/20',
      barColor: 'bg-critical',
    },
    {
      label: 'Moderate',
      count: report.summary.moderate,
      icon: AlertCircle,
      colorClass: 'bg-moderate/10 text-moderate-foreground border-moderate/20',
      barColor: 'bg-moderate',
    },
    {
      label: 'Minor',
      count: report.summary.minor,
      icon: Info,
      colorClass: 'bg-minor/10 text-minor border-minor/20',
      barColor: 'bg-minor',
    },
  ];

  const maxCount = Math.max(report.summary.critical, report.summary.moderate, report.summary.minor, 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {summaryItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-xl border p-4 ${item.colorClass}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <span className="text-3xl font-bold">{item.count}</span>
          </div>
          <motion.div
            className={`absolute bottom-0 left-0 h-1 ${item.barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${(item.count / maxCount) * 100}%` }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
