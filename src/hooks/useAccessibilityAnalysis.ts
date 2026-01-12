import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AccessibilityReport, ScanStatus, AccessibilityIssue } from '@/types/accessibility';
import { toast } from 'sonner';

interface AnalysisResult {
  issues: AccessibilityIssue[];
  score: number;
  summary: {
    critical: number;
    moderate: number;
    minor: number;
    total: number;
  };
  userId?: string;
}

export function useAccessibilityAnalysis() {
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [report, setReport] = useState<AccessibilityReport | null>(null);

  const analyzeUrl = useCallback(async (url: string) => {
    setScanStatus({ status: 'scanning', progress: 10, message: 'Fetching website content...' });
    setReport(null);

    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Please sign in to analyze websites');
      }

      // Progress updates for UX
      const progressSteps = [
        { progress: 25, message: 'Analyzing DOM structure...' },
        { progress: 45, message: 'Checking color contrast...' },
        { progress: 65, message: 'Validating ARIA attributes...' },
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          setScanStatus({
            status: 'scanning',
            progress: progressSteps[stepIndex].progress,
            message: progressSteps[stepIndex].message,
          });
          stepIndex++;
        }
      }, 1000);

      setScanStatus(prev => ({ ...prev, status: 'analyzing', progress: 75, message: 'Generating AI recommendations...' }));

      const { data, error } = await supabase.functions.invoke('analyze-accessibility', {
        body: { url },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message || 'Failed to analyze website');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data as AnalysisResult;

      // Create the report
      const newReport: AccessibilityReport = {
        id: crypto.randomUUID(),
        url,
        scanDate: new Date(),
        score: result.score || 0,
        issues: result.issues || [],
        summary: result.summary || {
          critical: 0,
          moderate: 0,
          minor: 0,
          total: 0,
        },
      };

      // Save to database with user_id
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('accessibility_reports').insert({
            url: newReport.url,
            score: newReport.score,
            issues: newReport.issues as any,
            summary: newReport.summary as any,
            user_id: user.id,
          });
        }
      } catch (dbError) {
        console.warn('Failed to save report to database:', dbError);
        // Continue even if saving fails
      }

      setReport(newReport);
      setScanStatus({ status: 'complete', progress: 100, message: 'Scan complete!' });
      toast.success(`Analysis complete! Found ${newReport.summary.total} issues.`);

    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setScanStatus({ status: 'error', progress: 0, message: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const analyzeHtml = useCallback(async (htmlContent: string, fileName: string) => {
    setScanStatus({ status: 'scanning', progress: 10, message: 'Analyzing uploaded file...' });
    setReport(null);

    try {
      // Get current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Please sign in to analyze files');
      }

      setScanStatus({ status: 'analyzing', progress: 50, message: 'Generating AI recommendations...' });

      const { data, error } = await supabase.functions.invoke('analyze-accessibility', {
        body: { htmlContent },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze file');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data as AnalysisResult;

      const newReport: AccessibilityReport = {
        id: crypto.randomUUID(),
        url: `file://${fileName}`,
        scanDate: new Date(),
        score: result.score || 0,
        issues: result.issues || [],
        summary: result.summary || {
          critical: 0,
          moderate: 0,
          minor: 0,
          total: 0,
        },
      };

      setReport(newReport);
      setScanStatus({ status: 'complete', progress: 100, message: 'Analysis complete!' });
      toast.success(`Analysis complete! Found ${newReport.summary.total} issues.`);

    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setScanStatus({ status: 'error', progress: 0, message: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const reset = useCallback(() => {
    setScanStatus({ status: 'idle', progress: 0, message: '' });
    setReport(null);
  }, []);

  return {
    scanStatus,
    report,
    analyzeUrl,
    analyzeHtml,
    reset,
  };
}
