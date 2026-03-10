import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

type ToneOption = "bold" | "professional" | "casual" | "analytical" | "direct" | "persuasive" | "minimal" | "confident";

export interface StepOneData {
  headline: string;
  aboutSection: string;
  role: string;
  targetIcp: string;
  customIcp: string;
  tones: ToneOption[];
}

interface StepOneProps {
  data: StepOneData;
  onNext: (data: StepOneData) => void;
}

const icpOptions = [
  "CHROs",
  "Talent Leaders",
  "RevOps",
  "Sales Leaders",
  "Founders",
  "Marketers",
  "Other",
];

const toneOptions: ToneOption[] = [
  "bold", "professional", "casual", "analytical",
  "direct", "persuasive", "minimal", "confident",
];

const StepOne = ({ data, onNext }: StepOneProps) => {
  const [formData, setFormData] = useState<StepOneData>(data);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const handleToneToggle = (tone: ToneOption) => {
    setFormData((prev) => {
      const currentTones = prev.tones;
      if (currentTones.includes(tone)) {
        if (currentTones.length > 1) {
          return { ...prev, tones: currentTones.filter((t) => t !== tone) };
        }
        return prev;
      }
      return { ...prev, tones: [...currentTones, tone] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string | undefined> = {};

    if (!formData.headline.trim()) newErrors.headline = "Please enter your current headline";
    if (!formData.aboutSection.trim()) newErrors.aboutSection = "Please enter your current About section";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext(formData);
  };

  return (
    <div className="card-elevated p-8 md:p-10 glow-accent animate-scale-in max-w-2xl mx-auto">
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
            placeholder="CEO @ Company | Helping teams achieve X"
            value={formData.headline}
            onChange={(e) => {
              setFormData({ ...formData, headline: e.target.value });
              if (errors.headline) setErrors({ ...errors, headline: undefined });
            }}
            className={errors.headline ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
          />
          {errors.headline && <p className="text-sm text-destructive">{errors.headline}</p>}
        </div>

        {/* Current About Section */}
        <div className="space-y-2">
          <label htmlFor="about" className="block text-sm font-medium text-foreground">
            Current LinkedIn About Section <span className="text-primary">*</span>
          </label>
          <textarea
            id="about"
            placeholder="I help companies achieve..."
            value={formData.aboutSection}
            onChange={(e) => {
              setFormData({ ...formData, aboutSection: e.target.value });
              if (errors.aboutSection) setErrors({ ...errors, aboutSection: undefined });
            }}
            rows={6}
            className={`flex w-full rounded-lg border bg-input px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none ${
              errors.aboutSection
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary"
            }`}
          />
          {errors.aboutSection && <p className="text-sm text-destructive">{errors.aboutSection}</p>}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium text-foreground">Your Role</label>
          <Input
            id="role"
            type="text"
            placeholder="CEO, VP of Sales, Marketing Director"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>

        {/* Target ICP */}
        <div className="space-y-2">
          <label htmlFor="target-icp" className="block text-sm font-medium text-foreground">Target ICP</label>
          <select
            id="target-icp"
            value={formData.targetIcp}
            onChange={(e) => setFormData({ ...formData, targetIcp: e.target.value, customIcp: "" })}
            className="flex w-full rounded-lg border bg-input px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border focus:border-primary"
          >
            <option value="">Select your target audience</option>
            {icpOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {formData.targetIcp === "Other" && (
            <Input
              type="text"
              placeholder="Enter your target audience"
              value={formData.customIcp}
              onChange={(e) => setFormData({ ...formData, customIcp: e.target.value })}
              className="mt-3"
            />
          )}
        </div>

        {/* Tone Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Tone Preference <span className="text-muted-foreground text-xs">(select one or more)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map((tone) => (
              <Button
                key={tone}
                type="button"
                variant="tone"
                data-active={formData.tones.includes(tone)}
                onClick={() => handleToneToggle(tone)}
                className="capitalize px-4 py-2"
              >
                {tone}
              </Button>
            ))}
          </div>
        </div>

        <Button type="submit" variant="hero" className="w-full mt-8">
          Next <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default StepOne;
