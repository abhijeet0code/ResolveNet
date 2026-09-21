import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  MapPin,
  FilePlus2,
  MessageCircleWarning,
  Swords,
  User,
  ArrowLeftRight,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, path: "/dashboard" },
  { label: "Map", icon: MapPin, path: "/dashboard/map" },
  { label: "Report", icon: FilePlus2, path: "/dashboard/create" },
  { label: "Complaints", icon: MessageCircleWarning, path: "/dashboard/complaints" },
  { label: "Challenges", icon: Swords, path: "/dashboard/challenges" },
  { label: "Profile", icon: User, path: "/dashboard/profile" },
];

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop / tablet sidebar - full height, no scroll, expands on toggle click */}
      <aside
        className={`hidden sm:flex h-full shrink-0 bg-background border-r border-border flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          expanded ? "w-56" : "w-20"
        }`}
      >
        <nav className="flex flex-col gap-1 px-3 pt-6">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-secondary text-text-primary"
                    : "text-text-secondary hover:bg-secondary hover:text-text-primary"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {expanded && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6 flex flex-col gap-3">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-3 px-2 py-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          </button>

          <button className="bg-primary text-white text-sm font-medium rounded-md px-3 py-2 text-center whitespace-nowrap overflow-hidden">
            {expanded ? "Terms & Conditions" : "T&C"}
          </button>
        </div>
      </aside>

      {/* Mobile - fixed bottom tab bar, icons only (Instagram style) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around py-2 z-50">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            end={path === "/dashboard"}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center justify-center p-2 transition-colors ${
                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
              }`
            }
          >
            <Icon className="w-6 h-6" strokeWidth={1.5} />
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;