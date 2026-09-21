import React from "react";
import Button from "../../shared/button/Button";
import { useNavigate } from "react-router-dom";


const CTASection = ({
  title = "See a problem worth solving?",
  description = "Report it, support it, or help build the solution.",
  buttonText = "Get Started",
}) => {
  const navigate = useNavigate();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="bg-primary rounded-2xl px-6 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-white/70">{description}</p>
        </div>

        <Button onClick={() => navigate("/dashboard")}
          variant="secondary"
          className="!w-auto !px-5 !py-2.5 text-sm bg-white text-primary hover:opacity-90 shrink-0"
        >
          {buttonText}
        </Button>
      </div>
    </section>
  );
};

export default CTASection;