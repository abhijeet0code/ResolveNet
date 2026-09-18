import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "../shared/button/Button";
import logo from "../assets/Resolve_net_logo-removebg.png";
import { useSelector } from "react-redux";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Explore", path: "/explore" },
  { name: "How it works", path: "/how-it-works" },
  { name: "Solutions", path: "/solutions" },
  { name: "About", path: "/about" },
];

const Navbar = () => {
  const user = useSelector((store) => store.auth.user);

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClasses = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-primary" : "text-text-secondary hover:text-primary"
    }`;

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${
          scrolled
            ? "top-4 mx-2 sm:mx-4 lg:mx-auto lg:max-w-6xl rounded-3xl bg-surface/50 backdrop-blur-md border border-border/50 shadow-lg"
            : "top-0 mx-0 max-w-none rounded-none bg-surface border-b border-border shadow-none"
        }
      `}
    >
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-300
          ${scrolled ? "px-5 sm:px-8 h-16" : "px-4 sm:px-6 lg:px-8 h-20"}
        `}
      >
        <NavLink to="/" className="flex items-center">
          <img src={logo} alt="ResolveNet" className="h-40 w-auto" />
        </NavLink>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.path} className={linkClasses}>
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-text-primary"
              aria-label="Go to profile"
            >
              {user.username?.[0]?.toUpperCase() || "U"}
            </button>
          ) : (
            <>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="!w-auto !px-4 !py-2 text-sm"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                variant="primary"
                className="!w-auto !px-4 !py-2 text-sm"
              >
                Join ResolveNet
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div
          className={`md:hidden bg-surface/90 backdrop-blur-md border-t border-border px-4 pb-4
            ${scrolled ? "rounded-b-2xl" : ""}
          `}
        >
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-col gap-3 mt-4">
            {user ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
                className="flex items-center gap-3 w-full text-sm font-medium text-text-primary"
              >
                <span className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </span>
                My Profile
              </button>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full text-sm"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/register")}
                  variant="primary"
                  className="w-full text-sm"
                >
                  Join ResolveNet
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;