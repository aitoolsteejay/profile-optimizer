import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onCtaClick: () => void;
}

const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center relative">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10 animate-fade-in">
        {/* Brand */}
        <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-6">
          Myntmore LinkedIn Profile Optimizer
        </p>
        
        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
          Your LinkedIn profile is{" "}
          <span className="text-primary">costing you deals.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 mb-4 font-medium max-w-3xl mx-auto">
          See how a small shift in positioning can instantly increase replies, authority, and inbound pipeline.
        </p>
        
        {/* Supporting muted line */}
        <p className="text-muted-foreground text-lg mb-10">
          Free profile clarity audit for professionals.
        </p>
        
        {/* CTA Button */}
        <Button 
          variant="hero" 
          size="xl" 
          onClick={onCtaClick}
          className="mb-16"
        >
          Make My Profile Better
          <ChevronDown className="ml-1 h-5 w-5" />
        </Button>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-muted-foreground" />
      </div>
    </section>
  );
};

export default HeroSection;
