import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Target, Zap } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-20 pb-12 bg-white">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Turn Your LinkedIn Profile <br />
            <span className="text-primary italic">Into a Pipeline</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Most professionals waste their LinkedIn real estate. Get a free clarity audit that shows you exactly how to position yourself for replies, authority, and inbound opportunities.
          </p>
          <Button 
            onClick={onStart}
            variant="hero" 
            size="xl" 
            className="rounded-full shadow-2xl"
          >
            Audit My Profile Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16">
            Your Profile Is Costing You Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: "Vague headlines that say nothing about the value you deliver",
                icon: <Target className="h-8 w-8 text-primary" />,
              },
              {
                title: "Generic summaries that blend in with everyone else",
                icon: <Zap className="h-8 w-8 text-primary" />,
              },
              {
                title: "Missing the exact words your ideal clients are searching for",
                icon: <TrendingUp className="h-8 w-8 text-primary" />,
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{item.icon}</div>
                <p className="text-lg font-medium leading-snug">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Get Instant Clarity on What to Fix
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Paste your LinkedIn profile URL. Our AI analyzes your positioning, identifies gaps in clarity, and gives you specific improvements that make decision-makers stop scrolling and start reaching out.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Paste your LinkedIn profile URL",
                desc: "Quick and easy input of your current profile details."
              },
              {
                step: "02",
                title: "Get your free clarity audit in seconds",
                desc: "Our AI engine processes your positioning against high-performing benchmarks."
              },
              {
                step: "03",
                title: "Implement changes and watch your pipeline grow",
                desc: "Apply the specific suggestions and start seeing better engagement."
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="text-5xl font-black text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-secondary/20 p-8 md:p-12 rounded-3xl border border-primary/10 relative">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              Client Result
            </div>
            <p className="text-xl md:text-2xl font-medium italic mb-6 text-center">
              "The clarity audit showed me exactly why I wasn't getting inbound. After applying the changes, I got 3 high-quality leads in the first week."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">S</div>
              <div className="text-left">
                <div className="font-bold">Founder @ SaaS Growth</div>
                <div className="text-sm text-muted-foreground">Increased LinkedIn Inbound by 300%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second CTA */}
      <section className="py-24 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-10 text-black">
            Stop Guessing, Start Positioning
          </h2>
          <Button 
            onClick={onStart}
            variant="secondary" 
            size="xl" 
            className="rounded-full bg-white text-black hover:bg-white/90 shadow-2xl"
          >
            Start My Free Audit
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
