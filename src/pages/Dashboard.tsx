import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, ExternalLink, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScanInput } from '@/components/ScanInput';
import { ScanProgress } from '@/components/ScanProgress';
import { AccessibilityScore } from '@/components/AccessibilityScore';
import { IssueSummary } from '@/components/IssueSummary';
import { IssueFilters } from '@/components/IssueFilters';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Severity, WCAGLevel } from '@/types/accessibility';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { useAccessibilityAnalysis } from '@/hooks/useAccessibilityAnalysis';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { scanStatus, report, analyzeUrl, analyzeHtml, reset } = useAccessibilityAnalysis();
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<WCAGLevel | 'all'>('all');
  
  // Get URL from query params (for re-scan from history)
  const urlFromParams = searchParams.get('url');

  // Auto-trigger scan if URL is provided in query params
  useEffect(() => {
    if (urlFromParams && scanStatus.status === 'idle') {
      analyzeUrl(urlFromParams);
      // Clear the URL param after triggering scan
      setSearchParams({});
    }
  }, [urlFromParams, scanStatus.status, analyzeUrl, setSearchParams]);

  const handleScan = (url: string) => {
    analyzeUrl(url);
  };

  const handleFileUpload = async (files: FileList) => {
    const file = files[0];
    if (file) {
      const content = await file.text();
      analyzeHtml(content, file.name);
    }
  };

  const handleNewScan = () => {
    reset();
    setSelectedSeverity('all');
    setSelectedLevel('all');
  };

  const handleDownloadPDF = () => {
    if (report) {
      generatePDFReport(report);
    }
  };

  const filteredIssues = report?.issues.filter((issue) => {
    const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const matchesLevel = selectedLevel === 'all' || issue.wcagLevel === selectedLevel;
    return matchesSeverity && matchesLevel;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-foreground transition-colors">Home</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Dashboard</span>
          </div>

          <AnimatePresence mode="wait">
            {scanStatus.status === 'idle' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold">Accessibility Dashboard</h1>
                  <p className="text-muted-foreground">
                    Enter a URL or upload files to scan for accessibility issues
                  </p>
                </div>
                <ScanInput 
                  onScan={handleScan} 
                  onFileUpload={handleFileUpload} 
                  isScanning={false} 
                />
              </motion.div>
            )}

            {scanStatus.status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {scanStatus.message || 'An error occurred during the scan.'}
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button onClick={handleNewScan} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}

            {(scanStatus.status === 'scanning' || scanStatus.status === 'analyzing') && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-md mx-auto py-16"
              >
                <ScanProgress status={scanStatus} />
              </motion.div>
            )}

            {scanStatus.status === 'complete' && report && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Report Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Accessibility Report</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      {report.url}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Scanned on {report.scanDate.toLocaleDateString()} at {report.scanDate.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewScan}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New Scan
                    </Button>
                    <Button onClick={handleDownloadPDF} className="gradient-hero hover:opacity-90">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>

                {/* Score and Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="card-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium text-muted-foreground">
                        Accessibility Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center py-4">
                      <AccessibilityScore score={report.score} />
                    </CardContent>
                  </Card>
                  
                  <div className="lg:col-span-2">
                    <IssueSummary report={report} />
                  </div>
                </div>

                {/* Filters and Issues */}
                <Card className="card-shadow">
                  <CardHeader className="border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <CardTitle>
                          Detected Issues 
                          <span className="text-muted-foreground font-normal ml-2">
                            ({filteredIssues.length} of {report.issues.length})
                          </span>
                        </CardTitle>
                      </div>
                      <IssueFilters
                        selectedSeverity={selectedSeverity}
                        selectedLevel={selectedLevel}
                        onSeverityChange={setSelectedSeverity}
                        onLevelChange={setSelectedLevel}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {filteredIssues.length > 0 ? (
                        filteredIssues.map((issue, index) => (
                          <IssueCard key={issue.id} issue={issue} index={index} />
                        ))
                      ) : report.issues.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4">🎉</div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            No accessibility issues found!
                          </h3>
                          <p className="text-muted-foreground">
                            Great job! This website appears to be well-optimized for accessibility.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No issues match your current filters
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
