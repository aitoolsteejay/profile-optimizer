import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

interface FormData {
  linkedinUrl: string;
  role: string;
  targetIcp: string;
  customIcp: string;
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
  "Other",
];

const InputSection = ({ onSubmit, isLoading }: InputSectionProps) => {
  const [formData, setFormData] = useState<FormData>({
    linkedinUrl: "",
    role: "",
    targetIcp: "Founders",
    customIcp: "",
    tone: "bold",
  });
  const [errors, setErrors] = useState<{ linkedinUrl?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate LinkedIn URL
    if (!formData.linkedinUrl.trim()) {
      setErrors({ linkedinUrl: "Please enter a valid LinkedIn URL" });
      return;
    }
    
    if (!formData.linkedinUrl.includes("linkedin.com")) {
      setErrors({ linkedinUrl: "Please enter a valid LinkedIn URL" });
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
            {/* LinkedIn URL */}
            <div className="space-y-2">
              <label htmlFor="linkedin-url" className="block text-sm font-medium text-foreground">
                LinkedIn Profile URL
              </label>
              <Input
                id="linkedin-url"
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                value={formData.linkedinUrl}
                onChange={(e) => {
                  setFormData({ ...formData, linkedinUrl: e.target.value });
                  if (errors.linkedinUrl) setErrors({});
                }}
                aria-describedby={errors.linkedinUrl ? "url-error" : undefined}
                className={errors.linkedinUrl ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
              />
              {errors.linkedinUrl && (
                <p id="url-error" className="text-sm text-destructive">
                  {errors.linkedinUrl}
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
                placeholder="Founder & CEO, SaaS for recruiting teams"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            
            {/* Target ICP */}
            <div className="space-y-2">
              <label htmlFor="target-icp" className="block text-sm font-medium text-foreground">
                Target ICP
              </label>
              <select
                id="target-icp"
                value={formData.targetIcp}
                onChange={(e) => setFormData({ ...formData, targetIcp: e.target.value })}
                className="flex h-12 w-full rounded-lg border border-border bg-input px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                {icpOptions.map((option) => (
                  <option key={option} value={option} className="bg-card">
                    {option}
                  </option>
                ))}
              </select>
              
              {formData.targetIcp === "Other" && (
                <Input
                  type="text"
                  placeholder="Specify your target ICP"
                  value={formData.customIcp}
                  onChange={(e) => setFormData({ ...formData, customIcp: e.target.value })}
                  className="mt-3"
                />
              )}
            </div>
            
            {/* Tone Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Tone
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
