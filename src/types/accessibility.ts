export type Severity = 'critical' | 'moderate' | 'minor';
export type WCAGLevel = 'A' | 'AA' | 'AAA';

export interface AccessibilityIssue {
  id: string;
  title: string;
  description: string;
  wcagCriteria: string;
  wcagLevel: WCAGLevel;
  severity: Severity;
  element?: string;
  aiSuggestion?: string;
  codeSnippet?: string;
  fixedCodeSnippet?: string;
}

export interface AccessibilityReport {
  id: string;
  url: string;
  scanDate: Date;
  score: number;
  issues: AccessibilityIssue[];
  summary: {
    critical: number;
    moderate: number;
    minor: number;
    total: number;
  };
}

export interface ScanStatus {
  status: 'idle' | 'scanning' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
}
