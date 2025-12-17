import { Check, Copy, TrendingUp, Target, Award, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ResultsSectionProps {
  results: {
    score: number;
    headlines: Array<{ angle: string; text: string }>;
    aboutSection: string;
    positioningAngles: Array<{ title: string; description: string }>;
    keywordScore: number;
    detectedKeywords: string[];
    recommendedKeywords: string[];
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
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-primary";
    return "text-destructive";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 70) return "Your profile has strong positioning fundamentals.";
    if (score >= 40) return "Your profile has potential but lacks clear positioning for your ICP.";
    return "Your profile does not clearly communicate what problem you solve or who it's for.";
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Profile Clarity Score */}
        <div className="card-elevated p-8 text-center animate-scale-in" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Profile Clarity Score
          </h3>
          <div className={`text-7xl md:text-8xl font-extrabold mb-4 ${getScoreColor(results.score)}`}>
            {results.score}
            <span className="text-3xl text-muted-foreground font-normal"> / 100</span>
          </div>
          <p className="text-lg text-foreground/80 max-w-lg mx-auto">
            {getScoreMessage(results.score)}
          </p>
          <div className="accent-divider mt-6 max-w-xs mx-auto" />
        </div>

        {/* Optimized Headlines */}
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

        {/* Optimized About Section */}
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
            <div className="prose prose-invert max-w-none">
              {results.aboutSection.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-foreground/90 text-lg leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Positioning Angles */}
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

        {/* Keyword ICP Score */}
        <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Keyword ICP Score</h3>
          </div>
          <div className="card-elevated p-6 md:p-8">
            {/* Score bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">ICP Relevance</span>
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
            
            {/* Recommendation */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-foreground/80">
                <span className="font-semibold text-primary">Recommendation:</span>{" "}
                Add keywords like{" "}
                <span className="font-medium">
                  {results.recommendedKeywords.join(", ")}
                </span>{" "}
                to increase clarity and authority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
