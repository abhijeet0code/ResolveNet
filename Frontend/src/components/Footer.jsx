import React from "react";
import { NavLink } from "react-router";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
const BRAND = {
  name: "ResolveNet",
  tagline:
    "Turning local challenges into real solutions — Jharkhand-first, built to scale across India.",
};

const footerLinks = {
  Product: [
    { name: "Explore Challenges", path: "/explore" },
    { name: "How it works", path: "/how-it-works" },
    { name: "Solutions", path: "/solutions" },
  ],

  Company: [
    { name: "About", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Contact", path: "/contact" },
  ],

  Resources: [
    { name: "Blog", path: "/blog" },
    { name: "FAQs", path: "/faqs" },
    { name: "Support", path: "/support" },
  ],

  Legal: [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ],
};

const socialLinks = [
  {
    icon: FaFacebookF,
    url: "https://facebook.com",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    url: "https://instagram.com",
    label: "Instagram",
  },
  {
    icon: FaLinkedinIn,
    url: "https://linkedin.com",
    label: "LinkedIn",
  },
  {
    icon: FaGithub,
    url: "https://github.com",
    label: "GitHub",
  },
];

const Footer = () => {
  const year = new Date().getFullYear(); 

  return (
    <footer className="bg-primary text-white/80">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">

        {/* Top Section */}
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <NavLink
              to="/"
              className="text-lg font-bold text-white"
            >
              {BRAND.name}
            </NavLink>

            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {BRAND.tagline}
            </p>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-accent"
                >
                  <Icon size={16} className="text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-4 text-sm font-semibold text-white">
                {section}
              </h4>

              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <NavLink
                      to={link.path}
                      className="text-sm text-white/60 transition-colors duration-300 hover:text-white"
                    >
                      {link.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-white/50 sm:text-left">
            © {year} {BRAND.name}. All rights reserved.
          </p>

          <p className="text-center text-xs text-white/50 sm:text-right">
            Made for citizens, government, universities & industry.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;