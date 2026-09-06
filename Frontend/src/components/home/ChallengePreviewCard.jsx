// src/components/ChallengePreviewCard.jsx
import React from "react";

const ChallengePreviewCard = ({
  label = "LIVE CHALLENGE PREVIEW",
  title,
  location,
  distance,
  status = "Verified • High Priority",
  supports,
  summary,
}) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6 w-full lg:w-[380px] shrink-0">
      <p className="text-xs font-medium text-text-muted tracking-wide mb-3">
        {label}
      </p>

      <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>

      <p className="text-sm text-text-secondary mb-3">
        {location} <span className="text-text-muted">•</span> {distance}
      </p>

      <p className="text-sm font-medium text-success mb-3">
        {status} {supports && `• ${supports} Supports`}
      </p>

      <p className="text-sm text-text-secondary leading-relaxed">
        <span className="font-medium text-text-primary">AI summary:</span>{" "}
        {summary}
      </p>
    </div>
  );
};

export default ChallengePreviewCard;