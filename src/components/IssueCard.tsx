import { motion } from 'framer-motion';
import { ChevronDown, Code, Lightbulb, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { AccessibilityIssue } from '@/types/accessibility';
import { SeverityBadge } from './SeverityBadge';
import { WCAGBadge } from './WCAGBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface IssueCardProps {
  issue: AccessibilityIssue;
  index: number;
}

export function IssueCard({ issue, index }: IssueCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="card-shadow hover:shadow-card-lg transition-shadow duration-200">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={issue.severity} />
                    <WCAGBadge level={issue.wcagLevel} />
                    <span className="text-xs text-muted-foreground">
                      {issue.wcagCriteria}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {issue.description}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {issue.element && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    Affected Element
                  </div>
                  <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto font-mono">
                    {issue.element}
                  </pre>
                </div>
              )}

              {issue.aiSuggestion && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    AI Recommendation
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg border border-accent text-sm">
                    {issue.aiSuggestion}
                  </div>
                </div>
              )}

              {issue.fixedCodeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-score-excellent">
                    <Code className="h-4 w-4" />
                    Suggested Fix
                  </div>
                  <pre className="p-3 bg-[hsl(142_70%_45%/0.1)] border border-[hsl(142_70%_45%/0.3)] rounded-lg text-xs overflow-x-auto font-mono">
                    {issue.fixedCodeSnippet}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.w3.org/WAI/WCAG21/Understanding/${issue.wcagCriteria.toLowerCase().replace(/\./g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Learn More
                  </a>
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}
