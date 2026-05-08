import { Check, Copy, TrendingUp, Target, Award, Zap, AlertTriangle, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface QuotedIssue {
  issue_type: string;
  quoted_text: string;
  explanation: string;
}

interface ResultsSectionProps {
  results: {
    score: number;
    scoreVerdict: string;
    scoreReason: string;
    holdingBack: string[];
    quotedIssues?: QuotedIssue[];
    headlines: Array<{ angle: string; text: string }>;
    aboutSection: string;
    positioningAngles: Array<{ title: string; description: string }>;
    keywordScore: number;
    detectedKeywords: string[];
    missingKeywords: string[];
  };
}

const ResultsSection = ({ results }: ResultsSectionProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-primary";
    return "text-destructive";
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Profile Optimization Results", margin, y);
    y += 15;

    // Profile Clarity Score
    doc.setFontSize(14);
    doc.text(`Profile Clarity Score: ${results.score}/100`, margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const verdictLines = doc.splitTextToSize(`${results.scoreVerdict} ${results.scoreReason}`, maxWidth);
    doc.text(verdictLines, margin, y);
    y += verdictLines.length * 5 + 10;

    // What's Holding Back (with quoted issues)
    const issuesExist = (results.quotedIssues && results.quotedIssues.length > 0) || results.holdingBack.length > 0;
    if (issuesExist) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("What's Holding Your Profile Back", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Use quoted issues if available
      const issues = results.quotedIssues && results.quotedIssues.length > 0 
        ? results.quotedIssues.map(qi => `${qi.explanation}${qi.quoted_text ? ` ("${qi.quoted_text}")` : ''}`)
        : results.holdingBack;
      
      issues.forEach((issue) => {
        const lines = doc.splitTextToSize(`• ${issue}`, maxWidth);
        if (y + lines.length * 5 > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;
      });
      y += 8;
    }

    // Headlines
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (y > 250) { doc.addPage(); y = 20; }
    doc.text("Optimized Headlines", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    results.headlines.forEach((headline) => {
      const lines = doc.splitTextToSize(`${headline.angle}: ${headline.text}`, maxWidth);
      if (y + lines.length * 5 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin, y);
      y += lines.length * 5 + 4;
    });
    y += 6;

    // About Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (y > 250) { doc.addPage(); y = 20; }
    doc.text("Optimized About Section", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const aboutLines = doc.splitTextToSize(results.aboutSection, maxWidth);
    aboutLines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    });
    y += 10;

    // Positioning Angles
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (y > 250) { doc.addPage(); y = 20; }
    doc.text("Positioning Angles", margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    results.positioningAngles.forEach((angle) => {
      const lines = doc.splitTextToSize(`${angle.title}: ${angle.description}`, maxWidth);
      if (y + lines.length * 5 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin, y);
      y += lines.length * 5 + 4;
    });
    y += 6;

    // Keywords
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    if (y > 250) { doc.addPage(); y = 20; }
    doc.text(`ICP Relevance Score: ${results.keywordScore}/100`, margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Detected Keywords: ${results.detectedKeywords.join(", ")}`, margin, y);
    y += 6;
    if (results.missingKeywords.length > 0) {
      doc.text(`Missing Keywords: ${results.missingKeywords.join(", ")}`, margin, y);
    }

    doc.save("profile-optimization-results.pdf");
  };

  // Determine which issues to display - prefer quoted issues
  const hasQuotedIssues = results.quotedIssues && results.quotedIssues.length > 0;

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto mb-6 flex justify-end">
        <Button onClick={downloadPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download as PDF
        </Button>
      </div>
      <div className="max-w-4xl mx-auto space-y-10">
        {/* 1. Profile Clarity Score */}
        <div className="card-elevated p-8 text-center animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Profile Clarity Score
          </h3>
          <div className={`text-7xl md:text-8xl font-extrabold mb-4 ${getScoreColor(results.score)}`}>
            {results.score}
            <span className="text-3xl text-muted-foreground font-normal"> / 100</span>
          </div>
          <p className="text-xl font-semibold text-foreground mb-2">
            {results.scoreVerdict}
          </p>
          <p className="text-foreground/70 max-w-lg mx-auto">
            {results.scoreReason}
          </p>
        </div>

        {/* 2. What's Holding You Back - with quoted feedback */}
        {(hasQuotedIssues || results.holdingBack.length > 0) && (
          <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold">What's Holding Your Profile Back</h3>
            </div>
            <div className="card-elevated p-6">
              <ul className="space-y-4">
                {hasQuotedIssues ? (
                  results.quotedIssues!.map((issue, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive mt-2.5 shrink-0" />
                      <div className="space-y-1">
                        <span className="text-foreground/90">{issue.explanation}</span>
                        {issue.quoted_text && (
                          <p className="text-sm text-muted-foreground italic pl-4 border-l-2 border-muted">
                            "{issue.quoted_text}"
                          </p>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  results.holdingBack.map((issue, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive mt-2.5 shrink-0" />
                      <span className="text-foreground/80">{issue}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}

        {/* 3. Optimized Headlines */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Optimized Headlines</h3>
          </div>
          <div className="space-y-4">
            {results.headlines.map((headline, index) => (
              <div key={index} className="card-elevated p-6 group hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
                      {headline.angle}
                    </span>
                    <p className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
                      {headline.text}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(headline.text, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy headline"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Optimized About Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Optimized About Section</h3>
          </div>
          <div className="card-elevated p-6 md:p-8 group hover:border-primary/50 transition-colors">
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(results.aboutSection, 100)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedIndex === 100 ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="prose max-w-none">
              {results.aboutSection.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-foreground/90 text-lg leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Positioning Angles */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Positioning Angles</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {results.positioningAngles.map((angle, index) => (
              <div key={index} className="card-elevated p-6 hover:border-primary/50 transition-colors">
                <h4 className="text-primary font-semibold mb-3">{angle.title}</h4>
                <p className="text-foreground/80 leading-relaxed">{angle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Keyword & ICP Score */}
        <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Keyword and ICP Relevance</h3>
          </div>
          
          <p className="text-muted-foreground text-sm mb-6 max-w-3xl">
            This analysis determines how well your profile aligns with the audience you want to attract and influences search visibility, message resonance, and inbound profile views.
          </p>
          
          <div className="card-elevated p-6 md:p-8">
            {/* Score bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">ICP Relevance Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(results.keywordScore)}`}>
                  {results.keywordScore} / 100
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${results.keywordScore}%` }}
                />
              </div>
            </div>
            
            {/* Detected keywords */}
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">Detected Keywords</p>
              <div className="flex flex-wrap gap-2">
                {results.detectedKeywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-secondary rounded-full text-sm text-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing keywords */}
            {results.missingKeywords.length > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-foreground/80">
                  <span className="font-semibold text-primary">Missing High Signal Keywords:</span>{" "}
                  <span className="font-medium">
                    {results.missingKeywords.join(", ")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
