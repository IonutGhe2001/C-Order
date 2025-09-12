import React, { useState } from "react";

interface StepperRenderProps {
  step: number;
  next: () => void;
  back: () => void;
  isLast: boolean;
  setStep: (step: number) => void;
}

interface StepperProps {
  steps: string[];
  children: (props: StepperRenderProps) => React.ReactNode;
}

export default function Stepper({ steps, children }: StepperProps) {
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col h-full">
      <div className="w-full bg-muted rounded mb-4 overflow-hidden">
        <div
          className="bg-brand text-white text-xs font-medium text-center py-1 transition-all"
          style={{ width: `${progress}%` }}
        >
          {steps[step]}
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        {children({
          step,
          next,
          back,
          isLast: step === steps.length - 1,
          setStep,
        })}
      </div>
    </div>
  );
}