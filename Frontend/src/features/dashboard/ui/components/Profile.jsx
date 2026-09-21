import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Link as LinkIcon,
  Grid3x3,
  Bookmark,
  Award,
  Image as ImageIcon,
  Inbox,
} from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance";

// static for now — move to backend-driven data once the badges API exists
const badgeDefs = [
  { key: "first_report", label: "First Report", tone: "accent" },
  { key: "problem_solver", label: "5 Resolved", tone: "success" },
  { key: "active_citizen", label: "Active Citizen", tone: "warning" },
];

const toneClasses = {
  accent: "bg-accent-light text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const tabs = [
  { key: "reports", label: "Reports", icon: Grid3x3 },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "badges", label: "Badges", icon: Award },
];

const Profile = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const profile = user?.profile; // nested profile data from /me/

  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch "my reports" once on mount
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("/api/posts/mine/");
        setReports(res.data.results || res.data);
      } catch (err) {
        setError("Couldn't load your reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // lazy-fetch saved reports only the first time that tab is opened
  useEffect(() => {
    if (activeTab !== "saved" || saved.length) return;
    const fetchSaved = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("/reports/saved/");
        setSaved(res.data);
      } catch (err) {
        setError("Couldn't load saved reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [activeTab]);

  const stats = [
    { label: "Reports", value: reports.length },
    { label: "Resolved", value: reports.filter((r) => r.status === "resolved").length },
    { label: "Impact Pts", value: user?.impact_points ?? 0 },
  ];

  const activeItems = activeTab === "reports" ? reports : activeTab === "saved" ? saved : [];
  const showGrid = activeTab === "reports" || activeTab === "saved";
  const isLoading = loading && showGrid;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover strip */}
      <div className="h-28 sm:h-36 bg-gradient-to-r from-primary via-primary-light to-accent" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-card border-4 border-background ring-2 ring-accent-light flex items-center justify-center overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-semibold text-text-secondary">
                {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-1">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-text-primary">
                {profile?.full_name || "Your Name"}
              </h1>
              <p className="text-sm text-text-secondary">
                @{profile?.username || "username"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard/profile-setup")}
                className="bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
              >
                Edit Profile
              </button>
              <button className="border border-border text-text-secondary text-sm font-medium rounded-md px-4 py-2 hover:bg-secondary transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-6 px-1">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center sm:items-start">
              <span className="text-base font-semibold text-text-primary">{value}</span>
              <span className="text-xs text-text-secondary">{label}</span>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="mt-5 px-1">
          <p className="text-sm text-text-primary leading-relaxed">
            {profile?.bio || "No bio added yet."}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-text-secondary">
            {profile?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city}
                {profile.state ? `, ${profile.state}` : ""}
              </span>
            )}
            <span className="flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" />
              resolvenet.org/{profile?.username || "profile"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-8 mt-8 border-t border-border">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 py-3 border-t-2 -mt-px text-xs sm:text-sm font-medium transition-colors ${
                activeTab === key
                  ? "border-primary text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-12">
          {error && (
            <p className="text-sm text-error text-center py-6">{error}</p>
          )}

          {/* Badges tab */}
          {!error && activeTab === "badges" && (
            <div className="flex flex-wrap gap-3 pt-6">
              {badgeDefs.map(({ key, label, tone }) => (
                <span
                  key={key}
                  className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 ${toneClasses[tone]}`}
                >
                  <Award className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Reports / Saved grid */}
          {!error && showGrid && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-card border border-border rounded-sm sm:rounded-md animate-pulse"
                    />
                  ))}
                </div>
              ) : activeItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-text-muted">
                  <Inbox className="w-8 h-8" strokeWidth={1.5} />
                  <p className="text-sm">
                    {activeTab === "reports" ? "No reports yet." : "Nothing saved yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-4">
                  {activeItems.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square bg-card border border-border rounded-sm sm:rounded-md overflow-hidden flex items-center justify-center"
                    >
                      {item.media?.[0]?.image_url ? (
                        <img
                          src={item.media[0].image_url}
                          alt={item.media[0].alt_text || item.caption}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;