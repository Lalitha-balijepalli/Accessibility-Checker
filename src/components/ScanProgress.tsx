import { motion } from 'framer-motion';
import { ScanStatus } from '@/types/accessibility';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ScanProgressProps {
  status: ScanStatus;
}

const steps = [
  { key: 'scanning', label: 'Scanning website structure' },
  { key: 'analyzing', label: 'Analyzing accessibility issues' },
  { key: 'ai', label: 'Generating AI recommendations' },
  { key: 'complete', label: 'Report ready' },
];

export function ScanProgress({ status }: ScanProgressProps) {
  const currentStepIndex = 
    status.status === 'scanning' ? 0 :
    status.status === 'analyzing' ? 1 :
    status.status === 'complete' ? 3 : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          animate={{ rotate: status.status !== 'complete' ? 360 : 0 }}
          transition={{ repeat: status.status !== 'complete' ? Infinity : 0, duration: 2, ease: 'linear' }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-hero"
        >
          {status.status === 'complete' ? (
            <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
          ) : status.status === 'error' ? (
            <AlertCircle className="h-8 w-8 text-primary-foreground" />
          ) : (
            <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
          )}
        </motion.div>
        <h3 className="text-lg font-semibold">{status.message}</h3>
      </div>

      <Progress value={status.progress} className="h-2" />

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= currentStepIndex ? 1 : 0.4,
              x: 0 
            }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
              ${index < currentStepIndex ? 'bg-primary text-primary-foreground' :
                index === currentStepIndex ? 'bg-primary text-primary-foreground animate-pulse' :
                'bg-muted text-muted-foreground'}`}
            >
              {index < currentStepIndex ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-sm ${index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
