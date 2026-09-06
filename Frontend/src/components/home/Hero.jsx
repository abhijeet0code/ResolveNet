import React from "react";
import Button from "../../shared/button/Button";
import ChallengePreviewCard from "./ChallengePreviewCard";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
        {/* Left content */}
        <div className="max-w-2xl">
          <span className="inline-block bg-card text-text-secondary text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            Jharkhand-first • Built to scale across India
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-5">
            Turn local challenges into real solutions.
          </h1>

          <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed">
            ResolveNet connects citizens, government, universities and
            industry to report, verify, collaborate and solve real-world
            societal challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" className="!w-full sm:!w-auto">
              Report a Challenge
            </Button>
            <Button variant="outline" className="!w-full sm:!w-auto">
              Explore Challenges
            </Button>
          </div>
        </div>

        {/* Right preview card */}
        <ChallengePreviewCard
          title="Waterlogging near school road"
          location="Ranchi, Jharkhand"
          distance="2.1 km away"
          supports="214"
          summary="Repeated waterlogging blocks access to a school and nearby homes during heavy rain."
        />
      </div>
    </section>
  );
};

export default Hero;