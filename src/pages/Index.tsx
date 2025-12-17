import { useState, useRef } from "react";
import HeroSection from "@/components/HeroSection";
import InputSection from "@/components/InputSection";
import LoadingState from "@/components/LoadingState";
import ResultsSection from "@/components/ResultsSection";
import CTASection from "@/components/CTASection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  headline: string;
  aboutSection: string;
  role: string;
  targetIcp: string;
  tone: "bold" | "professional" | "casual";
}

// Rule-based Profile Clarity Score calculation
const calculateClarityScore = (headline: string, aboutSection: string, targetIcp: string): { 
  score: number; 
  verdict: string; 
  reason: string; 
  holdingBack: string[] 
} => {
  let score = 100;
  const holdingBack: string[] = [];
  const combined = `${headline} ${aboutSection}`.toLowerCase();
  const icpLower = targetIcp.toLowerCase();

  // ICP not mentioned → -25
  if (targetIcp && !combined.includes(icpLower) && !combined.includes(icpLower.replace(/s$/, ''))) {
    score -= 25;
    holdingBack.push("Your target ICP is not clearly mentioned in your profile");
  }

  // No clear problem stated → -20
  const problemIndicators = ["help", "solve", "fix", "reduce", "eliminate", "improve", "transform", "accelerate", "streamline", "automate", "simplify"];
  const hasProblem = problemIndicators.some(word => combined.includes(word));
  if (!hasProblem) {
    score -= 20;
    holdingBack.push("No clear problem statement that shows what you solve");
  }

  // No outcome or metric → -20
  const outcomeIndicators = ["%", "x", "million", "billion", "thousand", "revenue", "growth", "increase", "decrease", "roi", "saved", "generated", "closed", "pipeline"];
  const numberPattern = /\d+/;
  const hasOutcome = outcomeIndicators.some(word => combined.includes(word)) || numberPattern.test(combined);
  if (!hasOutcome) {
    score -= 20;
    holdingBack.push("Missing concrete outcomes or metrics that demonstrate value");
  }

  // Vague language → -15
  const vagueWords = ["passionate", "building", "love", "excited", "helping", "making the world", "journey", "mission-driven"];
  const hasVague = vagueWords.some(word => combined.includes(word));
  if (hasVague) {
    score -= 15;
    holdingBack.push("Contains vague or generic language that doesn't differentiate you");
  }

  // No authority or credibility marker → -10
  const credibilityIndicators = ["founder", "ceo", "cto", "vp", "director", "head of", "ex-", "former", "led", "built", "scaled", "years", "clients", "companies", "trusted"];
  const hasCredibility = credibilityIndicators.some(word => combined.includes(word));
  if (!hasCredibility) {
    score -= 10;
    holdingBack.push("No clear authority or credibility markers");
  }

  // Role unclear → -10
  if (headline.length < 15 || !headline.includes("|") && !headline.includes("—") && !headline.includes("-") && !headline.includes("@")) {
    score -= 10;
    holdingBack.push("Role and positioning are unclear from the headline");
  }

  // Clamp score between 25 and 90
  score = Math.max(25, Math.min(90, score));

  // Generate verdict based on score
  let verdict: string;
  let reason: string;

  if (score >= 75) {
    verdict = "Strong positioning foundation.";
    reason = "Your profile has clear elements of authority, ICP focus, and value proposition. Fine-tune the suggestions below to maximize impact.";
  } else if (score >= 55) {
    verdict = "Room for significant improvement.";
    reason = "Your profile has potential but lacks critical positioning elements. The optimizations below will dramatically increase your authority and relevance.";
  } else {
    verdict = "Your positioning needs work.";
    reason = "Your profile doesn't clearly communicate what problem you solve or who you help. The rewrites below will transform how prospects perceive you.";
  }

  return { score, verdict, reason, holdingBack };
};

// Extract keywords from content
const extractKeywords = (content: string): string[] => {
  const words = content.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const stopWords = new Set(['that', 'this', 'with', 'have', 'from', 'they', 'been', 'were', 'being', 'their', 'which', 'about', 'would', 'there', 'could', 'other', 'into', 'more', 'some', 'such', 'only', 'than', 'then', 'them']);
  const meaningfulWords = words.filter(word => !stopWords.has(word));
  
  // Count frequency
  const freq: Record<string, number> = {};
  meaningfulWords.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  
  // Return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
};

// Calculate keyword relevance score
const calculateKeywordScore = (detectedKeywords: string[], targetIcp: string): { score: number; missingKeywords: string[] } => {
  const icpKeywords: Record<string, string[]> = {
    founders: ["startup", "scale", "growth", "funding", "product", "market", "revenue"],
    ceos: ["strategy", "leadership", "growth", "revenue", "executive", "board"],
    chros: ["talent", "hiring", "recruiting", "culture", "hr", "workforce", "retention"],
    "talent leaders": ["recruiting", "hiring", "talent", "acquisition", "pipeline", "candidates"],
    revops: ["revenue", "operations", "pipeline", "sales", "crm", "automation", "efficiency"],
    "vps of sales": ["sales", "revenue", "quota", "pipeline", "deals", "closing", "team"],
    "marketing leaders": ["marketing", "brand", "demand", "leads", "campaigns", "growth"],
    ctos: ["technology", "engineering", "architecture", "scaling", "infrastructure", "product"],
  };

  const icpLower = targetIcp.toLowerCase();
  let relevantKeywords: string[] = [];
  
  Object.entries(icpKeywords).forEach(([key, keywords]) => {
    if (icpLower.includes(key) || key.includes(icpLower)) {
      relevantKeywords = [...relevantKeywords, ...keywords];
    }
  });
  
  if (relevantKeywords.length === 0) {
    relevantKeywords = ["results", "growth", "impact", "value", "solution", "expert"];
  }

  const detectedSet = new Set(detectedKeywords);
  const matchCount = relevantKeywords.filter(kw => detectedSet.has(kw)).length;
  const score = Math.min(100, Math.round((matchCount / Math.min(5, relevantKeywords.length)) * 100));
  
  const missingKeywords = relevantKeywords
    .filter(kw => !detectedSet.has(kw))
    .slice(0, 4);

  return { score: Math.max(20, score), missingKeywords };
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      // Calculate rule-based scores
      const { score, verdict, reason, holdingBack } = calculateClarityScore(
        formData.headline, 
        formData.aboutSection, 
        formData.targetIcp
      );
      
      const detectedKeywords = extractKeywords(`${formData.headline} ${formData.aboutSection}`);
      const { score: keywordScore, missingKeywords } = calculateKeywordScore(detectedKeywords, formData.targetIcp);

      // Call AI for content generation
      const { data, error } = await supabase.functions.invoke('optimize-profile', {
        body: {
          headline: formData.headline,
          aboutSection: formData.aboutSection,
          role: formData.role || "Founder",
          targetIcp: formData.targetIcp || "Founders",
          tone: formData.tone,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to optimize profile');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Combine rule-based analysis with AI-generated content
      const finalResults = {
        score,
        scoreVerdict: verdict,
        scoreReason: reason,
        holdingBack,
        headlines: [
          { angle: "Authority Angle", text: data.headlines?.authority || "Unable to generate headline" },
          { angle: "Problem-Solver Angle", text: data.headlines?.problemSolver || "Unable to generate headline" },
          { angle: "Social Proof Angle", text: data.headlines?.socialProof || "Unable to generate headline" },
        ],
        aboutSection: data.aboutSection || "Unable to generate about section",
        positioningAngles: [
          { title: "Authority", description: data.positioningAngles?.authority || "Position yourself as an expert" },
          { title: "Problem-Solver", description: data.positioningAngles?.problemSolver || "Focus on solutions you provide" },
          { title: "Social Proof", description: data.positioningAngles?.socialProof || "Leverage your track record" },
        ],
        keywordScore,
        detectedKeywords,
        missingKeywords,
      };
      
      setResults(finalResults);
      setShowResults(true);
      
      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
      }, 100);
      
    } catch (error) {
      console.error('Error optimizing profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <HeroSection onCtaClick={scrollToInput} />
      
      {/* Input Section */}
      <div ref={inputSectionRef}>
        {!showResults && <InputSection onSubmit={handleFormSubmit} isLoading={isLoading} />}
      </div>
      
      {/* Loading State */}
      {isLoading && <LoadingState />}
      
      {/* Results */}
      {showResults && results && (
        <>
          <ResultsSection results={results} />
          <CTASection />
        </>
      )}
      
      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Profile Optimizer. Built for founders who want more inbound.</p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
