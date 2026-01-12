import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History as HistoryIcon, 
  ExternalLink, 
  Calendar, 
  Search, 
  ArrowUpDown,
  ChevronRight,
  FileText,
  Trash2,
  RefreshCw,
  GitCompare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AccessibilityScore } from '@/components/AccessibilityScore';

interface ReportSummary {
  critical: number;
  moderate: number;
  minor: number;
  total: number;
}

interface HistoryReport {
  id: string;
  url: string;
  score: number;
  summary: ReportSummary;
  created_at: string;
}

type SortOption = 'newest' | 'oldest' | 'highest-score' | 'lowest-score' | 'most-issues';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<HistoryReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<HistoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchQuery, sortBy, scoreFilter]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('accessibility_reports')
        .select('id, url, score, summary, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedReports: HistoryReport[] = (data || []).map((report) => {
        const summary = report.summary as unknown as ReportSummary;
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
          created_at: report.created_at,
        };
      });

      setReports(typedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((report) =>
        report.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Score filter
    if (scoreFilter !== 'all') {
      filtered = filtered.filter((report) => {
        switch (scoreFilter) {
          case 'excellent':
            return report.score >= 90;
          case 'good':
            return report.score >= 70 && report.score < 90;
          case 'needs-work':
            return report.score >= 50 && report.score < 70;
          case 'poor':
            return report.score < 50;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest-score':
          return b.score - a.score;
        case 'lowest-score':
          return a.score - b.score;
        case 'most-issues':
          return b.summary.total - a.summary.total;
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('accessibility_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.filter((r) => r.id !== reportId));
      toast.success('Report deleted');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleRescan = (url: string) => {
    // Navigate to dashboard with URL as query param to trigger re-scan
    navigate(`/dashboard?url=${encodeURIComponent(url)}`);
  };

  const handleCompare = (url: string) => {
    // Navigate to compare page with URL pre-selected
    navigate(`/compare?url=${encodeURIComponent(url)}`);
  };

  // Get count of reports per URL for showing compare button
  const getReportCountForUrl = (url: string) => {
    return reports.filter((r) => r.url === url).length;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
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

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Scan History</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <HistoryIcon className="h-8 w-8 text-primary" />
                Scan History
              </h1>
              <p className="text-muted-foreground">
                View and manage your previous accessibility scans
              </p>
            </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/compare">
                <GitCompare className="h-4 w-4 mr-2" />
                Compare Scans
              </Link>
            </Button>
            <Button asChild className="gradient-hero hover:opacity-90">
              <Link to="/dashboard">
                <FileText className="h-4 w-4 mr-2" />
                New Scan
              </Link>
            </Button>
          </div>
          </div>

          {/* Filters */}
          <Card className="card-shadow mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="excellent">Excellent (90+)</SelectItem>
                    <SelectItem value="good">Good (70-89)</SelectItem>
                    <SelectItem value="needs-work">Needs Work (50-69)</SelectItem>
                    <SelectItem value="poor">Poor (&lt;50)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest-score">Highest Score</SelectItem>
                    <SelectItem value="lowest-score">Lowest Score</SelectItem>
                    <SelectItem value="most-issues">Most Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="py-16 text-center">
                {reports.length === 0 ? (
                  <>
                    <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start by scanning a website to build your history
                    </p>
                    <Button asChild className="gradient-hero">
                      <Link to="/dashboard">Start Your First Scan</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No matching results</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredReports.length} of {reports.length} reports
              </p>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="card-shadow hover:shadow-card-lg transition-all duration-300">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Score */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <div className="w-20 h-20">
                            <AccessibilityScore score={report.score} size="sm" />
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* URL */}
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <a
                              href={report.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary transition-colors truncate"
                              title={report.url}
                            >
                              {truncateUrl(report.url)}
                            </a>
                          </div>
                          
                          {/* Date */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(report.created_at)}
                          </div>

                          {/* Issue Summary */}
                          <div className="flex flex-wrap items-center gap-2">
                            {report.summary.critical > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {report.summary.critical} Critical
                              </Badge>
                            )}
                            {report.summary.moderate > 0 && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                {report.summary.moderate} Moderate
                              </Badge>
                            )}
                            {report.summary.minor > 0 && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                {report.summary.minor} Minor
                              </Badge>
                            )}
                            {report.summary.total === 0 && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                No Issues
                              </Badge>
                            )}
                          </div>

                          {/* Score Label */}
                          <span className={`text-sm font-medium ${getScoreColor(report.score)}`}>
                            {getScoreLabel(report.score)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 lg:self-center">
                          {getReportCountForUrl(report.url) >= 2 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCompare(report.url)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <GitCompare className="h-4 w-4 mr-1" />
                              Compare
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRescan(report.url)}
                            className="text-primary hover:text-primary"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Re-scan
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Report</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this report? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReport(report.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
