import { useState, useRef } from "react";
import HeroSection from "@/components/HeroSection";
import InputSection from "@/components/InputSection";
import LoadingState from "@/components/LoadingState";
import ResultsSection from "@/components/ResultsSection";
import CTASection from "@/components/CTASection";

// Mock results generator (simulates AI analysis)
const generateMockResults = (formData: any) => {
  const role = formData.role || "Founder & CEO, SaaS for recruiting teams";
  const icp = formData.targetIcp === "Other" ? formData.customIcp : formData.targetIcp;
  
  return {
    score: 42,
    headlines: [
      {
        angle: "Authority Angle",
        text: `Founder @ HireFlow — Helping ${icp}s cut hiring time by 40% with workflow automation`,
      },
      {
        angle: "Problem-Solver Angle",
        text: `Fixing slow recruiting operations for ${icp}s → Automated pipelines that speed up hiring`,
      },
      {
        angle: "Social Proof Angle",
        text: `Trusted by 120+ ${icp}s | Building the fastest recruiting ops platform`,
      },
    ],
    aboutSection: `I'm the founder of HireFlow, a recruiting ops automation platform used by 120+ ${icp}s to accelerate hiring without adding headcount.

Before this, I scaled recruiting systems at high-growth teams and saw firsthand how manual workflows slow everything down.

Today, I help ${icp}s streamline operations, automate candidate movement, and give their teams more time to focus on real conversations — not admin tasks.`,
    positioningAngles: [
      {
        title: "Authority",
        description: `Recognized recruiter-ops expert helping ${icp}s modernize hiring systems.`,
      },
      {
        title: "Problem-Solver",
        description: "Fixing broken hiring workflows with automation and structured pipelines.",
      },
      {
        title: "Social Proof",
        description: `120+ ${icp}s rely on HireFlow to move faster with fewer resources.`,
      },
    ],
    keywordScore: 78,
    detectedKeywords: ["recruiting", "hiring", "workflow", "talent teams"],
    recommendedKeywords: ["CHRO", "talent acquisition", "recruiting ops", "ATS integration"],
  };
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    setShowResults(false);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3500));
    
    // Generate mock results
    const mockResults = generateMockResults(formData);
    
    setResults(mockResults);
    setIsLoading(false);
    setShowResults(true);
    
    // Scroll to results after a brief delay
    setTimeout(() => {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }, 100);
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
