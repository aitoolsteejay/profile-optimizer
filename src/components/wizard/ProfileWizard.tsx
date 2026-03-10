import { useState } from "react";
import WizardProgress from "./WizardProgress";
import StepOne, { StepOneData } from "./StepOne";
import StepTwo, { StepTwoData } from "./StepTwo";
import { supabase } from "@/integrations/supabase/client";

export interface WizardData {
  stepOne: StepOneData;
  stepTwo: StepTwoData;
}

interface ProfileWizardProps {
  onComplete: (data: WizardData) => void;
  isGenerating: boolean;
}

const ProfileWizard = ({ onComplete, isGenerating }: ProfileWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    linkedinUrl: "",
    headline: "",
    aboutSection: "",
    role: "",
    targetIcp: "",
    customIcp: "",
    tones: ["bold"],
    dataSource: "manual",
  });
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    name: "",
    email: "",
    companyName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleStepOneComplete = (data: StepOneData) => {
    setStepOneData(data);
    setCurrentStep(2);
  };

  const handleStepTwoComplete = async (data: StepTwoData) => {
    setStepTwoData(data);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const effectiveIcp = stepOneData.targetIcp === "Other"
        ? stepOneData.customIcp
        : stepOneData.targetIcp;

      const { error } = await supabase.from("leads").insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        company_name: data.companyName.trim(),
        role: stepOneData.role.trim(),
        company_description: stepOneData.aboutSection.trim(),
        target_icp: effectiveIcp || "Not specified",
        custom_icp: stepOneData.targetIcp === "Other" ? stepOneData.customIcp : null,
        selected_tones: stepOneData.tones,
      });

      if (error) {
        console.error("Failed to save lead:", error);
        setSubmitError("Something went wrong saving your results. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setCurrentStep(3);
      onComplete({
        stepOne: stepOneData,
        stepTwo: data,
      });
    } catch (error) {
      console.error("Failed to save lead:", error);
      setSubmitError("Something went wrong saving your results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="wizard-section" className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <WizardProgress currentStep={currentStep} totalSteps={3} />

        {currentStep === 1 && (
          <div className="animate-fade-in">
            <StepOne data={stepOneData} onNext={handleStepOneComplete} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <StepTwo
              data={stepTwoData}
              onSubmit={handleStepTwoComplete}
              isSubmitting={isSubmitting || isGenerating}
              error={submitError}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileWizard;
