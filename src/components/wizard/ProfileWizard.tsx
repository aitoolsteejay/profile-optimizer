import { useState } from "react";
import WizardProgress from "./WizardProgress";
import StepOne, { StepOneData } from "./StepOne";

export interface WizardData {
  stepOne: StepOneData;
}

interface ProfileWizardProps {
  onComplete: (data: StepOneData) => void;
  isGenerating: boolean;
}

const ProfileWizard = ({ onComplete, isGenerating }: ProfileWizardProps) => {
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    headline: "",
    aboutSection: "",
    role: "",
    targetIcp: "",
    customIcp: "",
    tones: ["bold"],
  });

  const handleStepOneComplete = (data: StepOneData) => {
    setStepOneData(data);
    onComplete(data);
  };

  return (
    <section id="wizard-section" className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="animate-fade-in">
          <StepOne data={stepOneData} onNext={handleStepOneComplete} />
        </div>
      </div>
    </section>
  );
};

export default ProfileWizard;
