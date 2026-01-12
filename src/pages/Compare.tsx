import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  GitCompare, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AccessibilityScore } from '@/components/AccessibilityScore';
import { AccessibilityIssue } from '@/types/accessibility';
import { generateComparisonPDF } from '@/utils/comparisonPdfGenerator';

interface ReportSummary {
  critical: number;
  moderate: number;
  minor: number;
  total: number;
}

interface CompareReport {
  id: string;
  url: string;
  score: number;
  summary: ReportSummary;
  issues: AccessibilityIssue[];
  created_at: string;
}

export default function Compare() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState<CompareReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [leftReportId, setLeftReportId] = useState<string>('');
  const [rightReportId, setRightReportId] = useState<string>('');

  // Get unique URLs from reports
  const uniqueUrls = useMemo(() => {
    const urlSet = new Set(reports.map((r) => r.url));
    return Array.from(urlSet);
  }, [reports]);

  // Get reports for selected URL
  const urlReports = useMemo(() => {
    return reports.filter((r) => r.url === selectedUrl).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reports, selectedUrl]);

  // Get selected reports
  const leftReport = useMemo(() => 
    reports.find((r) => r.id === leftReportId), [reports, leftReportId]
  );
  const rightReport = useMemo(() => 
    reports.find((r) => r.id === rightReportId), [reports, rightReportId]
  );

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  // Handle URL from search params
  useEffect(() => {
    const urlParam = searchParams.get('url');
    const leftParam = searchParams.get('left');
    const rightParam = searchParams.get('right');

    if (urlParam && uniqueUrls.includes(urlParam)) {
      setSelectedUrl(urlParam);
    }
    if (leftParam) setLeftReportId(leftParam);
    if (rightParam) setRightReportId(rightParam);
  }, [searchParams, uniqueUrls]);

  // Auto-select first URL if none selected
  useEffect(() => {
    if (!selectedUrl && uniqueUrls.length > 0) {
      setSelectedUrl(uniqueUrls[0]);
    }
  }, [uniqueUrls, selectedUrl]);

  // Auto-select reports when URL changes
  useEffect(() => {
    if (urlReports.length >= 2 && !leftReportId && !rightReportId) {
      setLeftReportId(urlReports[1]?.id || '');
      setRightReportId(urlReports[0]?.id || '');
    } else if (urlReports.length === 1 && !rightReportId) {
      setRightReportId(urlReports[0]?.id || '');
      setLeftReportId('');
    }
  }, [urlReports]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('accessibility_reports')
        .select('id, url, score, summary, issues, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedReports: CompareReport[] = (data || []).map((report) => {
        const summary = report.summary as unknown as ReportSummary;
        const issues = report.issues as unknown as AccessibilityIssue[];
        return {
          id: report.id,
          url: report.url,
          score: report.score,
          summary: {
            critical: summary?.critical ?? 0,
            moderate: summary?.moderate ?? 0,
            minor: summary?.minor ?? 0,
            total: summary?.total ?? 0,
          },
          issues: issues || [],
          created_at: report.created_at,
        };
      });

      setReports(typedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const getScoreDiff = () => {
    if (!leftReport || !rightReport) return null;
    return rightReport.score - leftReport.score;
  };

  const getIssueDiff = (type: 'critical' | 'moderate' | 'minor' | 'total') => {
    if (!leftReport || !rightReport) return null;
    return rightReport.summary[type] - leftReport.summary[type];
  };

  const getDiffIcon = (diff: number | null, inverted = false) => {
    if (diff === null) return null;
    const isPositive = inverted ? diff < 0 : diff > 0;
    const isNegative = inverted ? diff > 0 : diff < 0;
    
    if (isPositive) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (isNegative) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getDiffColor = (diff: number | null, inverted = false) => {
    if (diff === null) return '';
    const isPositive = inverted ? diff < 0 : diff > 0;
    const isNegative = inverted ? diff > 0 : diff < 0;
    
    if (isPositive) return 'text-green-600';
    if (isNegative) return 'text-red-600';
    return 'text-muted-foreground';
  };

  // Compare issues between two reports
  const compareIssues = () => {
    if (!leftReport || !rightReport) return { fixed: [], new: [], persistent: [] };

    const leftIssueIds = new Set(leftReport.issues.map((i) => i.wcagCriteria + i.title));
    const rightIssueIds = new Set(rightReport.issues.map((i) => i.wcagCriteria + i.title));

    const fixed = leftReport.issues.filter(
      (i) => !rightIssueIds.has(i.wcagCriteria + i.title)
    );
    const newIssues = rightReport.issues.filter(
      (i) => !leftIssueIds.has(i.wcagCriteria + i.title)
    );
    const persistent = rightReport.issues.filter(
      (i) => leftIssueIds.has(i.wcagCriteria + i.title)
    );

    return { fixed, new: newIssues, persistent };
  };

  const issueComparison = compareIssues();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/history" className="hover:text-foreground transition-colors">History</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Compare Scans</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <GitCompare className="h-8 w-8 text-primary" />
                Compare Scans
              </h1>
              <p className="text-muted-foreground">
                Track accessibility improvements over time
              </p>
            </div>
            {leftReport && rightReport && (
              <Button 
                onClick={() => generateComparisonPDF(leftReport, rightReport, issueComparison)}
                className="gradient-hero hover:opacity-90"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : uniqueUrls.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="py-16 text-center">
                <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No scans to compare</h3>
                <p className="text-muted-foreground mb-6">
                  Scan a website multiple times to compare results
                </p>
                <Button asChild className="gradient-hero">
                  <Link to="/dashboard">Start Scanning</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* URL and Report Selection */}
              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select URL</label>
                      <Select value={selectedUrl} onValueChange={(v) => {
                        setSelectedUrl(v);
                        setLeftReportId('');
                        setRightReportId('');
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a URL" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueUrls.map((url) => (
                            <SelectItem key={url} value={url}>
                              {truncateUrl(url)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Earlier Scan (Before)</label>
                      <Select value={leftReportId} onValueChange={setLeftReportId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scan" />
                        </SelectTrigger>
                        <SelectContent>
                          {urlReports.map((report) => (
                            <SelectItem 
                              key={report.id} 
                              value={report.id}
                              disabled={report.id === rightReportId}
                            >
                              {formatDate(report.created_at)} (Score: {report.score})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Later Scan (After)</label>
                      <Select value={rightReportId} onValueChange={setRightReportId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scan" />
                        </SelectTrigger>
                        <SelectContent>
                          {urlReports.map((report) => (
                            <SelectItem 
                              key={report.id} 
                              value={report.id}
                              disabled={report.id === leftReportId}
                            >
                              {formatDate(report.created_at)} (Score: {report.score})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {urlReports.length < 2 ? (
                <Card className="card-shadow">
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Need more scans to compare</h3>
                    <p className="text-muted-foreground mb-6">
                      This URL has only been scanned once. Re-scan to track changes.
                    </p>
                    <Button asChild className="gradient-hero">
                      <Link to={`/dashboard?url=${encodeURIComponent(selectedUrl)}`}>
                        Re-scan This URL
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : leftReport && rightReport ? (
                <>
                  {/* Comparison Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Report */}
                    <Card className="card-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Before
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(leftReport.created_at)}
                        </p>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center py-4">
                        <div className="mb-4">
                          <AccessibilityScore score={leftReport.score} size="sm" showLabel={false} />
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-center w-full">
                          <Badge variant="destructive" className="text-xs px-2 py-0.5">{leftReport.summary.critical} Critical</Badge>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">
                            {leftReport.summary.moderate} Moderate
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                            {leftReport.summary.minor} Minor
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Comparison Summary */}
                    <Card className="card-shadow bg-gradient-to-br from-primary/5 to-primary/10">
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-base">Changes</CardTitle>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="space-y-4">
                          {/* Score Change */}
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <span className="font-medium">Score</span>
                            <div className="flex items-center gap-2">
                              {getDiffIcon(getScoreDiff())}
                              <span className={`font-bold ${getDiffColor(getScoreDiff())}`}>
                                {getScoreDiff() !== null && getScoreDiff() > 0 ? '+' : ''}
                                {getScoreDiff()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Issue Changes */}
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <span className="font-medium">Critical</span>
                            <div className="flex items-center gap-2">
                              {getDiffIcon(getIssueDiff('critical'), true)}
                              <span className={`font-bold ${getDiffColor(getIssueDiff('critical'), true)}`}>
                                {getIssueDiff('critical') !== null && getIssueDiff('critical')! > 0 ? '+' : ''}
                                {getIssueDiff('critical')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <span className="font-medium">Total Issues</span>
                            <div className="flex items-center gap-2">
                              {getDiffIcon(getIssueDiff('total'), true)}
                              <span className={`font-bold ${getDiffColor(getIssueDiff('total'), true)}`}>
                                {getIssueDiff('total') !== null && getIssueDiff('total')! > 0 ? '+' : ''}
                                {getIssueDiff('total')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Right Report */}
                    <Card className="card-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          After
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(rightReport.created_at)}
                        </p>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center py-4">
                        <div className="mb-4">
                          <AccessibilityScore score={rightReport.score} size="sm" showLabel={false} />
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-center w-full">
                          <Badge variant="destructive" className="text-xs px-2 py-0.5">{rightReport.summary.critical} Critical</Badge>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5">
                            {rightReport.summary.moderate} Moderate
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                            {rightReport.summary.minor} Minor
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Issue Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Fixed Issues */}
                    <Card className="card-shadow border-green-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-5 w-5" />
                          Fixed Issues ({issueComparison.fixed.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-80 overflow-y-auto">
                        {issueComparison.fixed.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No issues fixed
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {issueComparison.fixed.map((issue, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-3 bg-green-50 rounded-lg border border-green-100"
                              >
                                <p className="text-sm font-medium text-green-800">{issue.title}</p>
                                <p className="text-xs text-green-600">{issue.wcagCriteria}</p>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* New Issues */}
                    <Card className="card-shadow border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-red-700">
                          <XCircle className="h-5 w-5" />
                          New Issues ({issueComparison.new.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-80 overflow-y-auto">
                        {issueComparison.new.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No new issues
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {issueComparison.new.map((issue, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-3 bg-red-50 rounded-lg border border-red-100"
                              >
                                <p className="text-sm font-medium text-red-800">{issue.title}</p>
                                <p className="text-xs text-red-600">{issue.wcagCriteria}</p>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Persistent Issues */}
                    <Card className="card-shadow border-yellow-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
                          <AlertTriangle className="h-5 w-5" />
                          Still Present ({issueComparison.persistent.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-80 overflow-y-auto">
                        {issueComparison.persistent.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            All previous issues resolved!
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {issueComparison.persistent.map((issue, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-3 bg-yellow-50 rounded-lg border border-yellow-100"
                              >
                                <p className="text-sm font-medium text-yellow-800">{issue.title}</p>
                                <p className="text-xs text-yellow-600">{issue.wcagCriteria}</p>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card className="card-shadow">
                  <CardContent className="py-12 text-center">
                    <GitCompare className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select two scans to compare</h3>
                    <p className="text-muted-foreground">
                      Choose a before and after scan from the dropdowns above
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}