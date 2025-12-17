import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

interface FormData {
  headline: string;
  aboutSection: string;
  role: string;
  targetIcp: string;
  tone: "bold" | "professional" | "casual";
}

interface InputSectionProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const icpOptions = [
  "Founders",
  "CEOs",
  "CHROs",
  "Talent Leaders",
  "RevOps",
  "VPs of Sales",
  "Marketing Leaders",
  "CTOs",
];

const InputSection = ({ onSubmit, isLoading }: InputSectionProps) => {
  const [formData, setFormData] = useState<FormData>({
    headline: "",
    aboutSection: "",
    role: "",
    targetIcp: "",
    tone: "bold",
  });
  const [errors, setErrors] = useState<{ headline?: string; aboutSection?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { headline?: string; aboutSection?: string } = {};
    
    if (!formData.headline.trim()) {
      newErrors.headline = "Please enter your current headline";
    }
    
    if (!formData.aboutSection.trim()) {
      newErrors.aboutSection = "Please enter your current About section";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  return (
    <section id="input-section" className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="card-elevated p-8 md:p-10 glow-accent animate-scale-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Analyze Your Profile</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Headline */}
            <div className="space-y-2">
              <label htmlFor="headline" className="block text-sm font-medium text-foreground">
                Current LinkedIn Headline <span className="text-primary">*</span>
              </label>
              <Input
                id="headline"
                type="text"
                placeholder="Founder @ X | Building Y"
                value={formData.headline}
                onChange={(e) => {
                  setFormData({ ...formData, headline: e.target.value });
                  if (errors.headline) setErrors({ ...errors, headline: undefined });
                }}
                aria-describedby={errors.headline ? "headline-error" : undefined}
                className={errors.headline ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
              />
              {errors.headline && (
                <p id="headline-error" className="text-sm text-destructive">
                  {errors.headline}
                </p>
              )}
            </div>

            {/* Current About Section */}
            <div className="space-y-2">
              <label htmlFor="about" className="block text-sm font-medium text-foreground">
                Current LinkedIn About Section <span className="text-primary">*</span>
              </label>
              <textarea
                id="about"
                placeholder="I'm a founder who loves building products…"
                value={formData.aboutSection}
                onChange={(e) => {
                  setFormData({ ...formData, aboutSection: e.target.value });
                  if (errors.aboutSection) setErrors({ ...errors, aboutSection: undefined });
                }}
                rows={6}
                aria-describedby={errors.aboutSection ? "about-error" : undefined}
                className={`flex w-full rounded-lg border bg-input px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none ${
                  errors.aboutSection 
                    ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                    : "border-border focus:border-primary"
                }`}
              />
              {errors.aboutSection && (
                <p id="about-error" className="text-sm text-destructive">
                  {errors.aboutSection}
                </p>
              )}
            </div>
            
            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-foreground">
                Your Role
              </label>
              <Input
                id="role"
                type="text"
                placeholder="Founder & CEO, SaaS"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            
            {/* Target ICP */}
            <div className="space-y-2">
              <label htmlFor="target-icp" className="block text-sm font-medium text-foreground">
                Target ICP
              </label>
              <Input
                id="target-icp"
                type="text"
                placeholder="CHROs, Talent Leaders, RevOps"
                value={formData.targetIcp}
                onChange={(e) => setFormData({ ...formData, targetIcp: e.target.value })}
                list="icp-suggestions"
              />
              <datalist id="icp-suggestions">
                {icpOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            
            {/* Tone Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Tone Preference
              </label>
              <div className="flex flex-wrap gap-3">
                {(["bold", "professional", "casual"] as const).map((tone) => (
                  <Button
                    key={tone}
                    type="button"
                    variant="tone"
                    data-active={formData.tone === tone}
                    onClick={() => setFormData({ ...formData, tone })}
                    className="capitalize px-6"
                  >
                    {tone}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              className="w-full mt-8"
              disabled={isLoading}
            >
              {isLoading ? (
                "Analyzing..."
              ) : (
                <>
                  Make My Profile Better
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default InputSection;
