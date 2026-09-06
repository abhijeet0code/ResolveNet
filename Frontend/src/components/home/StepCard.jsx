// src/components/StepCard.jsx
import React from "react";

const StepCard = ({ number, title, description, icon: Icon }) => {
  return (
    <div className="group bg-surface border border-border rounded-xl p-5 transition-all duration-300 ease-in-out hover:border-accent   hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-text-muted transition-colors duration-300 group-hover:text-accent">
          {number}
        </span>
        {Icon && (
          <Icon
            size={20}
            className="text-accent transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>

      <h3 className="text-base font-bold text-text-primary mb-2 transition-colors duration-300 group-hover:text-accent">
        {title}
      </h3>

      <p className="text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default StepCard;