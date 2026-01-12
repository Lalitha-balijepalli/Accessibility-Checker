import jsPDF from 'jspdf';
import { AccessibilityIssue } from '@/types/accessibility';

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

interface IssueComparison {
  fixed: AccessibilityIssue[];
  new: AccessibilityIssue[];
  persistent: AccessibilityIssue[];
}

export function generateComparisonPDF(
  leftReport: CompareReport,
  rightReport: CompareReport,
  issueComparison: IssueComparison
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

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

  // Header
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Accessibility Comparison Report', 20, 28);

  yPos = 55;

  // URL Info
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`URL: ${leftReport.url}`, 20, yPos);
  yPos += 8;
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, yPos);
  yPos += 20;

  // Comparison Overview Section
  doc.setFillColor(248, 250, 252);
  doc.rect(15, yPos - 5, pageWidth - 30, 70, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Score Comparison', 20, yPos + 5);
  yPos += 15;

  // Before/After columns
  const colWidth = (pageWidth - 60) / 2;
  
  // Before column
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BEFORE', 25, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formatDate(leftReport.created_at), 25, yPos + 7);
  
  const leftScoreColor: [number, number, number] = leftReport.score >= 90 ? [34, 197, 94] : 
                   leftReport.score >= 70 ? [13, 148, 136] :
                   leftReport.score >= 50 ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(leftScoreColor[0], leftScoreColor[1], leftScoreColor[2]);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${leftReport.score}`, 25, yPos + 25);
  doc.setFontSize(12);
  doc.text('/100', 55, yPos + 25);
  
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Critical: ${leftReport.summary.critical} | Moderate: ${leftReport.summary.moderate} | Minor: ${leftReport.summary.minor}`, 25, yPos + 35);

  // After column
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('AFTER', 25 + colWidth + 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(formatDate(rightReport.created_at), 25 + colWidth + 20, yPos + 7);
  
  const rightScoreColor: [number, number, number] = rightReport.score >= 90 ? [34, 197, 94] : 
                   rightReport.score >= 70 ? [13, 148, 136] :
                   rightReport.score >= 50 ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(rightScoreColor[0], rightScoreColor[1], rightScoreColor[2]);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${rightReport.score}`, 25 + colWidth + 20, yPos + 25);
  doc.setFontSize(12);
  doc.text('/100', 55 + colWidth + 20, yPos + 25);
  
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Critical: ${rightReport.summary.critical} | Moderate: ${rightReport.summary.moderate} | Minor: ${rightReport.summary.minor}`, 25 + colWidth + 20, yPos + 35);

  yPos += 75;

  // Change Summary
  const scoreDiff = rightReport.score - leftReport.score;
  const totalDiff = rightReport.summary.total - leftReport.summary.total;
  
  doc.setFillColor(scoreDiff >= 0 ? 220 : 254, scoreDiff >= 0 ? 252 : 226, scoreDiff >= 0 ? 231 : 226);
  doc.rect(15, yPos - 5, pageWidth - 30, 25, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('Summary:', 20, yPos + 7);
  
  const scoreChange = scoreDiff > 0 ? `+${scoreDiff}` : `${scoreDiff}`;
  const issueChange = totalDiff > 0 ? `+${totalDiff}` : `${totalDiff}`;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Score: ${scoreChange} points  |  Issues: ${issueChange}  |  Fixed: ${issueComparison.fixed.length}  |  New: ${issueComparison.new.length}`, 60, yPos + 7);
  
  yPos += 35;

  // Fixed Issues Section
  if (issueComparison.fixed.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(220, 252, 231);
    doc.rect(15, yPos - 3, 4, 12, 'F');
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Fixed Issues (${issueComparison.fixed.length})`, 25, yPos + 5);
    yPos += 15;

    issueComparison.fixed.forEach((issue) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`✓ ${issue.title}`, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`WCAG ${issue.wcagCriteria} (Level ${issue.wcagLevel}) | ${issue.severity.toUpperCase()}`, 25, yPos + 6);
      yPos += 15;
    });
    
    yPos += 10;
  }

  // New Issues Section
  if (issueComparison.new.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(254, 226, 226);
    doc.rect(15, yPos - 3, 4, 12, 'F');
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`New Issues (${issueComparison.new.length})`, 25, yPos + 5);
    yPos += 15;

    issueComparison.new.forEach((issue) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`✗ ${issue.title}`, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`WCAG ${issue.wcagCriteria} (Level ${issue.wcagLevel}) | ${issue.severity.toUpperCase()}`, 25, yPos + 6);
      yPos += 15;
    });
    
    yPos += 10;
  }

  // Persistent Issues Section
  if (issueComparison.persistent.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(254, 249, 195);
    doc.rect(15, yPos - 3, 4, 12, 'F');
    doc.setTextColor(161, 98, 7);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Persistent Issues (${issueComparison.persistent.length})`, 25, yPos + 5);
    yPos += 15;

    issueComparison.persistent.forEach((issue) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`— ${issue.title}`, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`WCAG ${issue.wcagCriteria} (Level ${issue.wcagLevel}) | ${issue.severity.toUpperCase()}`, 25, yPos + 6);
      yPos += 15;
    });
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generated by A11yCheck - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const urlSlug = leftReport.url.replace(/[^a-z0-9]/gi, '-').substring(0, 30);
  const fileName = `comparison-report-${urlSlug}-${Date.now()}.pdf`;
  doc.save(fileName);
}
