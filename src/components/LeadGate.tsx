import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import myntmoreLogo from "@/assets/myntmore-logo.png";

export interface LeadData {
  name: string;
  companyName: string;
  companyEmail: string;
  companyWebsite: string;
  linkedinUrl: string;
}

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  companyEmail: z.string().trim().email("Please enter a valid email").max(255),
  companyWebsite: z.string().trim().min(1, "Company website is required").max(500),
  linkedinUrl: z.string().trim().min(1, "LinkedIn URL is required").max(500),
});

interface LeadGateProps {
  onComplete: (data: LeadData) => void;
}

const LeadGate = ({ onComplete }: LeadGateProps) => {
  const [formData, setFormData] = useState<LeadData>({
    name: "",
    companyName: "",
    companyEmail: "",
    companyWebsite: "",
    linkedinUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const d = result.data;
      const { error } = await supabase.from("leads").insert({
        name: d.name,
        company_name: d.companyName,
        email: d.companyEmail,
        company_website: d.companyWebsite,
        linkedin_url: d.linkedinUrl,
        role: "",
        company_description: "",
        target_icp: "Not specified",
      });

      if (error) {
        console.error("Failed to save lead:", error);
        setSubmitError("Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      onComplete(d as LeadData);
    } catch (err) {
      console.error("Failed to save lead:", err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof LeadData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const fields: { key: keyof LeadData; label: string; placeholder: string; type?: string }[] = [
    { key: "name", label: "Name", placeholder: "Rahul Mehta" },
    { key: "companyName", label: "Company Name", placeholder: "HireFlow" },
    { key: "companyEmail", label: "Company Email", placeholder: "rahul@hireflow.com", type: "email" },
    { key: "companyWebsite", label: "Company Website", placeholder: "https://hireflow.com" },
    { key: "linkedinUrl", label: "Personal LinkedIn URL", placeholder: "https://linkedin.com/in/rahulmehta" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background relative">
      <div className="absolute top-6 left-6">
        <img src={myntmoreLogo} alt="Myntmore" className="w-32 md:w-40 h-auto" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Myntmore Posting Rhythm Builder
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your details to get started
          </p>
        </div>

        <div className="card-elevated p-8 glow-accent">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map(({ key, label, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <label htmlFor={key} className="block text-sm font-medium text-foreground">
                  {label} <span className="text-primary">*</span>
                </label>
                <Input
                  id={key}
                  type={type || "text"}
                  placeholder={placeholder}
                  value={formData[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  className={errors[key] ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
                  disabled={isSubmitting}
                />
                {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
              </div>
            ))}

            {submitError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            <Button type="submit" variant="hero" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Get Started →"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadGate;
