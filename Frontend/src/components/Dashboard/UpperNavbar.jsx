import { useState } from "react";
import { Search, MapPin, Bell, User, X } from "lucide-react";
import logo from "../../assets/ResolveNet-favicon-white-detail.png"


const UpperNavbar = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav className="w-full bg-surface border-b border-border">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10  flex items-center justify-center shrink-0">
            <img src={logo} alt="ResolveNet" className="h-8 w-auto" />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-text-primary leading-tight">
              ResolveNet
            </h1>
            <p className="text-xs text-text-secondary leading-tight">
              Stronger Communities · Cleaner Cities
            </p>
          </div>

          <h1 className="text-base font-semibold text-text-primary sm:hidden">
            ResolveNet
          </h1>
        </div>

        {/* Search Bar - always visible on desktop */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="flex items-center gap-2 w-full bg-card border border-border rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search complaints, locations, or keywords"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Mobile search toggle */}
          <button
            className="md:hidden"
            onClick={() => setShowSearch((prev) => !prev)}
          >
            {showSearch ? (
              <X className="w-5 h-5 text-text-secondary" />
            ) : (
              <Search className="w-5 h-5 text-text-secondary" />
            )}
          </button>

          {/* Location - text on desktop, icon only on mobile */}
          <div className="hidden sm:flex items-center gap-1 border border-border rounded-md px-3 py-2 text-sm text-text-secondary">
            <MapPin className="w-4 h-4" />
            <span>Ranchi</span>
          </div>
          <button className="sm:hidden">
            <MapPin className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Notification */}
          <button className="relative">
            <Bell className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Avatar */}
          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Mobile search row - appears below navbar when toggled */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search complaints, locations, or keywords"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default UpperNavbar;