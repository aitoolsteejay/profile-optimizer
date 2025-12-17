import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {/* Accent line */}
        <div className="h-1 w-24 bg-primary mx-auto mb-12 rounded-full" />
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Imagine this applied across your{" "}
          <span className="text-primary">entire LinkedIn presence.</span>
        </h2>
        
        {/* Subtext */}
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          We don't just rewrite profiles — we help founders turn LinkedIn into a predictable inbound pipeline.
        </p>
        
        {/* Primary CTA */}
        <Button 
          variant="hero" 
          size="xl"
          className="mb-6"
          onClick={() => window.open("https://calendly.com", "_blank")}
        >
          Book a Strategy Call
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        {/* Secondary link */}
        <div>
          <button 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-medium group"
            onClick={() => window.open("#", "_blank")}
          >
            See how founder-led pipeline works
            <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
