// src/components/HowItWorks.jsx
import React from "react";
import { FileText, ShieldCheck, Users, Wrench, CheckCircle2 } from "lucide-react";
import StepCard from "./StepCard";

const steps = [
  {
    number: "01",
    title: "Report",
    description: "Share the issue with location, media and details.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Verify",
    description: "AI organizes it; authorities verify and prioritize.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Collaborate",
    description: "Universities and industry solvers propose solutions.",
    icon: Users,
  },
  {
    number: "04",
    title: "Implement",
    description: "Teams test, pilot and track milestones.",
    icon: Wrench,
  },
  {
    number: "05",
    title: "Resolve",
    description: "Evidence and community confirmation close the loop.",
    icon: CheckCircle2,
  },
];

const HowItWorks = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
        How ResolveNet works
      </h2>
      <p className="text-text-secondary mb-8">
        A clear path from reporting a problem to measurable resolution.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;