import { useState, useRef } from "react";
import LeadGate, { LeadData } from "@/components/LeadGate";
import ProfileWizard from "@/components/wizard/ProfileWizard";
import { StepOneData } from "@/components/wizard/StepOne";
import LoadingState from "@/components/LoadingState";
import ResultsSection from "@/components/ResultsSection";
import CTASection from "@/components/CTASection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import myntmoreLogo from "@/assets/myntmore-logo.png";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const calculateClarityScore = (
  headline: string,
  aboutSection: string,
  targetIcp: string
): {
  score: number;
  verdict: string;
  reason: string;
  holdingBack: string[];
} => {
  let score = 100;
  const holdingBack: string[] = [];
  const combined = `${headline} ${aboutSection}`.toLowerCase();

  const icpLower = targetIcp.toLowerCase();
  if (icpLower && !combined.includes(icpLower) && !combined.includes(icpLower.replace(/s$/, ""))) {
    score -= 15;
    holdingBack.push(`Your positioning does not explicitly reference "${targetIcp}" as your target audience.`);
  }

  const problemIndicators = ["help", "solve", "fix", "reduce", "eliminate", "improve", "transform", "accelerate", "streamline", "automate", "simplify"];
  if (!problemIndicators.some((word) => combined.includes(word))) {
    score -= 20;
    holdingBack.push("No clear problem statement found. Your positioning does not explicitly state what problem you solve.");
  }

  const outcomeIndicators = ["%", "x", "million", "billion", "thousand", "revenue", "growth", "increase", "decrease", "roi", "saved", "generated", "closed", "pipeline"];
  const numberPattern = /\d+/;
  if (!outcomeIndicators.some((word) => combined.includes(word)) && !numberPattern.test(combined)) {
    score -= 15;
    holdingBack.push("Missing concrete outcomes or metrics. Consider adding specific numbers or percentages.");
  }

  const vagueWords = ["passionate", "love", "excited", "making the world", "journey", "mission-driven"];
  const foundVague = vagueWords.filter((word) => combined.includes(word));
  if (foundVague.length > 0) {
    score -= 15;
    holdingBack.push(`Your positioning uses vague language like "${foundVague[0]}" which does not differentiate you.`);
  }

  const credibilityIndicators = ["ceo", "cto", "vp", "director", "head of", "founder", "co-founder", "ex-", "former", "led", "built", "scaled", "years", "clients", "companies"];
  if (!credibilityIndicators.some((word) => combined.includes(word))) {
    score -= 10;
    holdingBack.push("No clear authority or credibility markers. Consider adding signals like years of experience or notable achievements.");
  }

  score = Math.max(25, Math.min(95, score));

  let verdict: string;
  let reason: string;

  if (score >= 75) {
    verdict = "Strong positioning foundation.";
    reason = "Your positioning has clear elements of authority, ICP focus, and value proposition. Fine tune the suggestions below to maximize impact.";
  } else if (score >= 55) {
    verdict = "Room for significant improvement.";
    reason = "Your positioning has potential but lacks critical elements. The optimizations below will dramatically increase your authority and relevance.";
  } else {
    verdict = "Your positioning needs work.";
    reason = "Your positioning does not clearly communicate what problem you solve or who you help. The rewrites below will transform how prospects perceive you.";
  }

  return { score, verdict, reason, holdingBack };
};

const extractKeywords = (content: string): string[] => {
  const words = content.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 3);
  const stopWords = new Set(["that", "this", "with", "have", "from", "they", "been", "were", "being", "their", "which", "about", "would", "there", "could", "other", "into", "more", "some", "such", "only", "than", "then", "them"]);
  const meaningfulWords = words.filter((word) => !stopWords.has(word));
  const freq: Record<string, number> = {};
  meaningfulWords.forEach((word) => { freq[word] = (freq[word] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word]) => word);
};

const calculateKeywordScore = (
  detectedKeywords: string[],
  targetIcp: string
): { score: number; missingKeywords: string[] } => {
  const icpKeywords: Record<string, string[]> = {
    founders: ["startup", "scale", "growth", "funding", "product", "market", "revenue"],
    ceos: ["strategy", "leadership", "growth", "revenue", "executive", "board"],
    chros: ["talent", "hiring", "recruiting", "culture", "hr", "workforce", "retention"],
    "talent leaders": ["recruiting", "hiring", "talent", "acquisition", "pipeline", "candidates"],
    revops: ["revenue", "operations", "pipeline", "sales", "crm", "automation", "efficiency"],
    "sales leaders": ["sales", "revenue", "quota", "pipeline", "deals", "closing", "team"],
    marketers: ["marketing", "brand", "demand", "leads", "campaigns", "growth", "content"],
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
  const matchCount = relevantKeywords.filter((kw) => detectedSet.has(kw)).length;
  const score = Math.min(100, Math.round((matchCount / Math.min(5, relevantKeywords.length)) * 100));
  const missingKeywords = relevantKeywords.filter((kw) => !detectedSet.has(kw)).slice(0, 4);

  return { score: Math.max(20, score), missingKeywords };
};

const Index = () => {
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleLeadComplete = (data: LeadData) => {
    setLeadData(data);
  };

  const handleWizardComplete = async (profileData: StepOneData) => {
    setIsLoading(true);
    setShowResults(false);

    try {
      const effectiveIcp =
        profileData.targetIcp === "Other"
          ? profileData.customIcp
          : profileData.targetIcp;

      const { score, verdict, reason, holdingBack } = calculateClarityScore(
        profileData.headline,
        profileData.aboutSection,
        effectiveIcp
      );

      const detectedKeywords = extractKeywords(
        `${profileData.headline} ${profileData.aboutSection}`
      );
      const { score: keywordScore, missingKeywords } = calculateKeywordScore(
        detectedKeywords,
        effectiveIcp
      );

      const { data, error } = await supabase.functions.invoke("optimize-profile", {
        body: {
          headline: profileData.headline,
          aboutSection: profileData.aboutSection,
          role: profileData.role,
          targetIcp: effectiveIcp,
          tones: profileData.tones,
          userName: leadData?.name,
          companyName: leadData?.companyName,
        },
      });

      if (error) throw new Error(error.message || "Failed to optimize profile");
      if (data.error) throw new Error(data.error);

      const finalResults = {
        score,
        scoreVerdict: verdict,
        scoreReason: reason,
        holdingBack,
        headlines: [
          { angle: "Authority Angle", text: data.headlines?.authority || "Unable to generate headline" },
          { angle: "Problem Solver Angle", text: data.headlines?.problemSolver || "Unable to generate headline" },
          { angle: "Social Proof Angle", text: data.headlines?.socialProof || "Unable to generate headline" },
        ],
        aboutSection: data.aboutSection || "Unable to generate about section",
        positioningAngles: [
          { title: "Authority", description: data.positioningAngles?.authority || "Position yourself as an expert" },
          { title: "Problem Solver", description: data.positioningAngles?.problemSolver || "Focus on solutions you provide" },
          { title: "Social Proof", description: data.positioningAngles?.socialProof || "Leverage your track record" },
        ],
        keywordScore,
        detectedKeywords,
        missingKeywords,
      };

      setResults(finalResults);
      setShowResults(true);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error optimizing profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show lead gate first
  if (!leadData) {
    return <LeadGate onComplete={handleLeadComplete} />;
  }

  // After lead capture, show the tool
  return (
    <main className="min-h-screen bg-background">
      <header className="absolute top-6 left-6 z-50 flex items-center justify-between w-[calc(100%-3rem)]">
        <img src={myntmoreLogo} alt="Myntmore" className="w-[120px] h-auto" />
        <a
          href="https://calendly.com/founder-myntmore/1-hour-meeting"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="hero" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Book a Strategy Call
          </Button>
        </a>
      </header>

      {!showResults && !isLoading && (
        <div className="pt-24">
          <ProfileWizard onComplete={handleWizardComplete} isGenerating={isLoading} />
        </div>
      )}

      {isLoading && <LoadingState />}

      {showResults && results && (
        <>
          <div className="pt-24">
            <ResultsSection results={results} />
          </div>
          <CTASection />
        </>
      )}

      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Myntmore LinkedIn Profile Optimizer. Built for professionals who want more inbound.</p>
        </div>
      </footer>
    </main>
  );
};

export default Index;
