import React from "react";
import logo from "../assets/ResolveNet-favicon-white-detail.png";


const LoadingPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-6">
      {/* Logo space - place your own logo image/svg here */}
      <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center">
        <img src={logo} alt="ResolveNet" className="w-8 h-8" /> 
      </div>

      <h1 className="text-2xl font-semibold text-text-primary tracking-wide">
        ResolveNet
      </h1>

      {/* Loading dots */}
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full bg-primary animate-loading-dot"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-primary animate-loading-dot"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-primary animate-loading-dot"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      <style>{`
        @keyframes loading-dot {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          40% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
        .animate-loading-dot {
          animation: loading-dot 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;