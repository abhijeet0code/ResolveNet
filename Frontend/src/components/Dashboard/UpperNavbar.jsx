import { useState } from "react";
import { MapPin, Bell, User, X, LogOut } from "lucide-react";
import logo from "../../assets/ResolveNet-favicon-white-detail.png";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../features/auth/state/authAction"; // apna actual path daalo
import { removeUser } from "../../features/auth/state/authSlice"; // apna actual path daalo


const UpperNavbar = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const profile = user?.profile;

  const [showSearch, setShowSearch] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutUser());
    dispatch(removeUser());
    setIsLoggingOut(false);
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true }); // apna login route check kar lena
  };

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

        <div className="flex gap-[clamp(2rem,4vw,7rem)] ml-[clamp(2rem,10vh,rem)] ">
          {/* Location - text on desktop, icon only on mobile */}
          <div className="hidden  sm:flex items-center gap-1 border border-border rounded-md px-3 py-2 text-sm text-text-secondary">
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
          <button onClick={() => navigate("/dashboard/profile")} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-semibold text-text-secondary">
                {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}{" "}
          </button>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
            className="text-text-secondary hover:text-text-primary"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Logout confirm popup */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-surface border border-border p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-text-primary">
              Logout karna hai?
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Kya aap sach me ResolveNet se logout karna chahte ho?
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-md bg-[#1F2E24] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UpperNavbar;