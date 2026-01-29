import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

const WizardProgress = ({ currentStep, totalSteps }: WizardProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
              step < currentStep
                ? "bg-primary text-primary-foreground"
                : step === currentStep
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {step < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div
              className={cn(
                "h-0.5 w-8 ml-3 transition-colors duration-300",
                step < currentStep ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default WizardProgress;
