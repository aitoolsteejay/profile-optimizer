import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";

type ToneOption = "bold" | "professional" | "casual";

export interface StepOneData {
  role: string;
  companyDescription: string;
  targetIcp: string;
  customIcp: string;
  tones: ToneOption[];
}

interface StepOneProps {
  data: StepOneData;
  onNext: (data: StepOneData) => void;
}

const icpOptions = [
  "Founders",
  "CEOs",
  "CHROs",
  "Talent Leaders",
  "RevOps",
  "Other",
];

const toneOptions: ToneOption[] = ["bold", "professional", "casual"];

const StepOne = ({ data, onNext }: StepOneProps) => {
  const [formData, setFormData] = useState<StepOneData>(data);
  const [errors, setErrors] = useState<{
    role?: string;
    companyDescription?: string;
    targetIcp?: string;
  }>({});

  const handleToneToggle = (tone: ToneOption) => {
    setFormData((prev) => {
      const currentTones = prev.tones;
      if (currentTones.includes(tone)) {
        if (currentTones.length > 1) {
          return { ...prev, tones: currentTones.filter((t) => t !== tone) };
        }
        return prev;
      } else {
        return { ...prev, tones: [...currentTones, tone] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!formData.role.trim()) {
      newErrors.role = "This helps us generate accurate positioning.";
    }

    if (!formData.companyDescription.trim()) {
      newErrors.companyDescription = "This helps us generate accurate positioning.";
    }

    if (!formData.targetIcp) {
      newErrors.targetIcp = "This helps us generate accurate positioning.";
    }

    if (formData.targetIcp === "Other" && !formData.customIcp.trim()) {
      newErrors.targetIcp = "Please specify your target audience.";
    }

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
        <h2 className="text-2xl font-bold">Tell Us About Your Business</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Your Role */}
        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium text-foreground">
            Your Role <span className="text-primary">*</span>
          </label>
          <Input
            id="role"
            type="text"
            placeholder="Founder & CEO, SaaS tool for recruiting teams"
            value={formData.role}
            onChange={(e) => {
              setFormData({ ...formData, role: e.target.value });
              if (errors.role) setErrors({ ...errors, role: undefined });
            }}
            className={errors.role ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
          />
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role}</p>
          )}
        </div>

        {/* Company Description */}
        <div className="space-y-2">
          <label htmlFor="company-description" className="block text-sm font-medium text-foreground">
            What does your company do? <span className="text-primary">*</span>
          </label>
          <Input
            id="company-description"
            type="text"
            placeholder="Recruiting automation software for internal hiring teams"
            value={formData.companyDescription}
            onChange={(e) => {
              setFormData({ ...formData, companyDescription: e.target.value });
              if (errors.companyDescription) setErrors({ ...errors, companyDescription: undefined });
            }}
            className={errors.companyDescription ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
          />
          {errors.companyDescription && (
            <p className="text-sm text-destructive">{errors.companyDescription}</p>
          )}
        </div>

        {/* Target ICP */}
        <div className="space-y-2">
          <label htmlFor="target-icp" className="block text-sm font-medium text-foreground">
            Target ICP <span className="text-primary">*</span>
          </label>
          <select
            id="target-icp"
            value={formData.targetIcp}
            onChange={(e) => {
              setFormData({ ...formData, targetIcp: e.target.value, customIcp: "" });
              if (errors.targetIcp) setErrors({ ...errors, targetIcp: undefined });
            }}
            className={`flex w-full rounded-lg border bg-input px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
              errors.targetIcp
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-primary"
            }`}
          >
            <option value="">Select your target audience</option>
            {icpOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {formData.targetIcp === "Other" && (
            <Input
              type="text"
              placeholder="Enter your target audience"
              value={formData.customIcp}
              onChange={(e) => {
                setFormData({ ...formData, customIcp: e.target.value });
                if (errors.targetIcp) setErrors({ ...errors, targetIcp: undefined });
              }}
              className="mt-3"
            />
          )}
          {errors.targetIcp && (
            <p className="text-sm text-destructive">{errors.targetIcp}</p>
          )}
        </div>

        {/* Tone Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Tone Preference
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

        {/* Submit Button */}
        <Button type="submit" variant="hero" className="w-full mt-8">
          Next
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default StepOne;
