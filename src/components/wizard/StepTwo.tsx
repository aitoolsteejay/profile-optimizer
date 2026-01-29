import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";
import { z } from "zod";

export interface StepTwoData {
  name: string;
  email: string;
  companyName: string;
}

interface StepTwoProps {
  data: StepTwoData;
  onSubmit: (data: StepTwoData) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

const leadSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  companyName: z.string().trim().min(1, "Company name is required").max(200, "Company name must be less than 200 characters"),
});

const StepTwo = ({ data, onSubmit, isSubmitting, error }: StepTwoProps) => {
  const [formData, setFormData] = useState<StepTwoData>(data);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    companyName?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = leadSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; companyName?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setValidationErrors({});
    await onSubmit({
      name: result.data.name,
      email: result.data.email,
      companyName: result.data.companyName,
    });
  };

  return (
    <div className="card-elevated p-8 md:p-10 glow-accent animate-scale-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your profile audit is ready.</h2>
        <p className="text-muted-foreground">
          Enter your details to unlock your optimized headlines, positioning angles, and clarity score.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Full Name <span className="text-primary">*</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Rahul Mehta"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (validationErrors.name) setValidationErrors({ ...validationErrors, name: undefined });
            }}
            className={validationErrors.name ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
            disabled={isSubmitting}
          />
          {validationErrors.name && (
            <p className="text-sm text-destructive">{validationErrors.name}</p>
          )}
        </div>

        {/* Work Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Work Email <span className="text-primary">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="rahul@company.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (validationErrors.email) setValidationErrors({ ...validationErrors, email: undefined });
            }}
            className={validationErrors.email ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
            disabled={isSubmitting}
          />
          {validationErrors.email && (
            <p className="text-sm text-destructive">{validationErrors.email}</p>
          )}
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="company-name" className="block text-sm font-medium text-foreground">
            Company Name <span className="text-primary">*</span>
          </label>
          <Input
            id="company-name"
            type="text"
            placeholder="HireFlow"
            value={formData.companyName}
            onChange={(e) => {
              setFormData({ ...formData, companyName: e.target.value });
              if (validationErrors.companyName) setValidationErrors({ ...validationErrors, companyName: undefined });
            }}
            className={validationErrors.companyName ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
            disabled={isSubmitting}
          />
          {validationErrors.companyName && (
            <p className="text-sm text-destructive">{validationErrors.companyName}</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" variant="hero" className="w-full mt-8" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving your results…
            </>
          ) : (
            "Show My Results →"
          )}
        </Button>

        {/* Trust text */}
        <p className="text-xs text-muted-foreground text-center">
          No spam. We only use this to share your results and insights.
        </p>
      </form>
    </div>
  );
};

export default StepTwo;
