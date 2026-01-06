import { useState, useRef } from "react";
import HeroSection from "@/components/HeroSection";
import InputSection, { FormData, QuotedIssue } from "@/components/InputSection";
import LoadingState from "@/components/LoadingState";
import ResultsSection from "@/components/ResultsSection";
import CTASection from "@/components/CTASection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import myntmoreLogo from "@/assets/myntmore-logo.png";

// Helper to find exact quotes from profile text
const findQuote = (text: string, patterns: string[]): string | null => {
  const lowerText = text.toLowerCase();
  for (const pattern of patterns) {
    const idx = lowerText.indexOf(pattern.toLowerCase());
    if (idx !== -1) {
      // Extract surrounding context (up to 60 chars)
      const start = Math.max(0, idx);
      const end = Math.min(text.length, idx + Math.min(60, pattern.length + 20));
      return text.slice(start, end).trim();
    }
  }
  return null;
};

// Rule-based Profile Clarity Score calculation with quoted feedback
const calculateClarityScore = (headline: string, aboutSection: string, targetIcp: string): { 
  score: number; 
  verdict: string; 
  reason: string; 
  holdingBack: string[];
  quotedIssues: QuotedIssue[];
} => {
  let score = 100;
  const holdingBack: string[] = [];
  const quotedIssues: QuotedIssue[] = [];
  const combined = `${headline} ${aboutSection}`.toLowerCase();
  const combinedRaw = `${headline} ${aboutSection}`;
  const icpLower = targetIcp.toLowerCase();

  // ICP check
  if (targetIcp && !combined.includes(icpLower) && !combined.includes(icpLower.replace(/s$/, ''))) {
    score -= 25;
    quotedIssues.push({
      issue_type: "missing_icp",
      quoted_text: "",
      explanation: `No ICP detected. Your profile does not reference "${targetIcp}" in either the headline or About section.`
    });
  }

  // Problem statement check
  const problemIndicators = ["help", "solve", "fix", "reduce", "eliminate", "improve", "transform", "accelerate", "streamline", "automate", "simplify"];
  const hasProblem = problemIndicators.some(word => combined.includes(word));
  if (!hasProblem) {
    score -= 20;
    quotedIssues.push({
      issue_type: "no_problem_statement",
      quoted_text: "",
      explanation: "No clear problem statement found. Your profile does not explicitly state what problem you solve for your audience."
    });
  }

  // Outcomes check
  const outcomeIndicators = ["%", "x", "million", "billion", "thousand", "revenue", "growth", "increase", "decrease", "roi", "saved", "generated", "closed", "pipeline"];
  const numberPattern = /\d+/;
  const hasOutcome = outcomeIndicators.some(word => combined.includes(word)) || numberPattern.test(combined);
  if (!hasOutcome) {
    score -= 20;
    quotedIssues.push({
      issue_type: "no_outcomes",
      quoted_text: "",
      explanation: "Missing concrete outcomes or metrics. Your profile does not include specific numbers, percentages, or measurable results."
    });
  }

  // Vague language check with quotes
  const vagueWords = ["passionate", "building", "love", "excited", "helping", "making the world", "journey", "mission-driven"];
  const foundVague = vagueWords.filter(word => combined.includes(word));
  if (foundVague.length > 0) {
    score -= 15;
    const quote = findQuote(combinedRaw, foundVague);
    quotedIssues.push({
      issue_type: "vague_language",
      quoted_text: quote || foundVague[0],
      explanation: `Your profile uses vague language that does not differentiate you.`
    });
  }

  // Credibility markers check
  const credibilityIndicators = ["ceo", "cto", "vp", "director", "head of", "ex-", "former", "led", "built", "scaled", "years", "clients", "companies", "trusted", "advisor", "consultant", "expert"];
  const hasCredibility = credibilityIndicators.some(word => combined.includes(word));
  if (!hasCredibility) {
    score -= 10;
    quotedIssues.push({
      issue_type: "no_credibility",
      quoted_text: "",
      explanation: "No clear authority or credibility markers. Your profile lacks signals like titles, years of experience, or notable achievements."
    });
  }

  // Headline structure check
  if (headline.length < 15 || (!headline.includes("|") && !headline.includes("@"))) {
    score -= 10;
    quotedIssues.push({
      issue_type: "unclear_role",
      quoted_text: headline.length > 0 ? headline.slice(0, 50) : "",
      explanation: "Role and positioning are unclear from the headline. A strong headline typically includes your role and who you help."
    });
  }

  score = Math.max(25, Math.min(90, score));

  let verdict: string;
  let reason: string;

  if (score >= 75) {
    verdict = "Strong positioning foundation.";
    reason = "Your profile has clear elements of authority, ICP focus, and value proposition. Fine tune the suggestions below to maximize impact.";
  } else if (score >= 55) {
    verdict = "Room for significant improvement.";
    reason = "Your profile has potential but lacks critical positioning elements. The optimizations below will dramatically increase your authority and relevance.";
  } else {
    verdict = "Your positioning needs work.";
    reason = "Your profile does not clearly communicate what problem you solve or who you help. The rewrites below will transform how prospects perceive you.";
  }

  // Generate legacy holdingBack for backwards compatibility
  quotedIssues.forEach(qi => {
    holdingBack.push(qi.explanation);
  });

  return { score, verdict, reason, holdingBack, quotedIssues };
};

const extractKeywords = (content: string): string[] => {
  const words = content.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const stopWords = new Set(['that', 'this', 'with', 'have', 'from', 'they', 'been', 'were', 'being', 'their', 'which', 'about', 'would', 'there', 'could', 'other', 'into', 'more', 'some', 'such', 'only', 'than', 'then', 'them']);
  const meaningfulWords = words.filter(word => !stopWords.has(word));
  
  const freq: Record<string, number> = {};
  meaningfulWords.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
};

const calculateKeywordScore = (detectedKeywords: string[], targetIcp: string): { score: number; missingKeywords: string[] } => {
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
  const matchCount = relevantKeywords.filter(kw => detectedSet.has(kw)).length;
  const score = Math.min(100, Math.round((matchCount / Math.min(5, relevantKeywords.length)) * 100));
  
  const missingKeywords = relevantKeywords
    .filter(kw => !detectedSet.has(kw))
    .slice(0, 4);

  return { score: Math.max(20, score), missingKeywords };
};

// Scrape LinkedIn profile
const scrapeLinkedInProfile = async (url: string): Promise<{ success: boolean; headline?: string; about?: string; role?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-linkedin', {
      body: { url }
    });

    if (error) {
      console.error('Scrape function error:', error);
      return { success: false, error: error.message || 'Failed to fetch profile' };
    }

    return data;
  } catch (error) {
    console.error('Scrape error:', error);
    return { success: false, error: 'Failed to fetch profile. Please try again.' };
  }
};

// Log data to Supabase (silent, non-blocking)
const logOptimization = async (
  formData: FormData,
  results: {
    score: number;
    keywordScore: number;
    detectedKeywords: string[];
    missingKeywords: string[];
    headlines: Array<{ angle: string; text: string }>;
    aboutSection: string;
    positioningAngles: Array<{ title: string; description: string }>;
    quotedIssues?: QuotedIssue[];
  }
) => {
  try {
    const effectiveIcp = formData.targetIcp === "Other" ? formData.customIcp : formData.targetIcp;
    
    await supabase.from('profile_optimizations').insert({
      linkedin_url: formData.linkedinUrl || null,
      scraped_headline: formData.dataSource === "scraper" ? formData.headline : null,
      scraped_about: formData.dataSource === "scraper" ? formData.aboutSection : null,
      data_source: formData.dataSource,
      quoted_issues: results.quotedIssues || [],
      current_headline: formData.headline,
      current_about: formData.aboutSection,
      role: formData.role || null,
      target_icp: effectiveIcp || null,
      custom_icp_if_any: formData.targetIcp === "Other" ? formData.customIcp : null,
      selected_tones: formData.tones,
      profile_clarity_score: results.score,
      icp_relevance_score: results.keywordScore,
      detected_keywords: results.detectedKeywords,
      missing_keywords: results.missingKeywords,
      optimized_headlines: results.headlines,
      optimized_about: results.aboutSection,
      positioning_angles: results.positioningAngles,
    });
  } catch (error) {
    console.error('Failed to log optimization:', error);
  }
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
      const effectiveIcp = formData.targetIcp === "Other" ? formData.customIcp : formData.targetIcp;
      
      const { score, verdict, reason, holdingBack, quotedIssues } = calculateClarityScore(
        formData.headline, 
        formData.aboutSection, 
        effectiveIcp
      );
      
      const detectedKeywords = extractKeywords(`${formData.headline} ${formData.aboutSection}`);
      const { score: keywordScore, missingKeywords } = calculateKeywordScore(detectedKeywords, effectiveIcp);

      const { data, error } = await supabase.functions.invoke('optimize-profile', {
        body: {
          headline: formData.headline,
          aboutSection: formData.aboutSection,
          role: formData.role || "Professional",
          targetIcp: effectiveIcp || "Professionals",
          tones: formData.tones,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to optimize profile');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const finalResults = {
        score,
        scoreVerdict: verdict,
        scoreReason: reason,
        holdingBack,
        quotedIssues,
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
      
      logOptimization(formData, finalResults);
      
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
      <header className="absolute top-4 left-4 z-50">
        <img src={myntmoreLogo} alt="Myntmore" className="h-10 w-auto" />
      </header>
      <HeroSection onCtaClick={scrollToInput} />
      
      <div ref={inputSectionRef}>
        {!showResults && (
          <InputSection 
            onSubmit={handleFormSubmit} 
            isLoading={isLoading} 
            onScrape={scrapeLinkedInProfile}
          />
        )}
      </div>
      
      {isLoading && <LoadingState />}
      
      {showResults && results && (
        <>
          <ResultsSection results={results} />
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
