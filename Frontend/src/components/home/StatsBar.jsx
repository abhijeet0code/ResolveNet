// src/components/StatsBar.jsx
import React from "react";

const stats = [
  { value: "1,240+", label: "Demo challenges" },
  { value: "64%", label: "Demo verified" },
  { value: "320+", label: "Demo solutions" },
  { value: "24", label: "Jharkhand districts" },
];

const StatsBar = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="bg-primary rounded-2xl px-6 sm:px-10 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
};

export default StatsBar;