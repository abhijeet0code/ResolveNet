
import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import UpperNavbar from "../../components/Dashboard/UpperNavbar";
import Sidebar from "../../components/Dashboard/Sidebar";
import ProfileSetupWizard from "../../components/ProfileSetup/ProfileSetupWizard ";

const DashboardLayout = () => {
  const user = useSelector((state) => state.auth.user);

  const showProfileWizard = user && !user.profile_complete;

  return (
    <div className="flex flex-col h-screen bg-background">


      <UpperNavbar />

      {/* Dashboard */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          <Outlet />
        </main>

      </div>

      {/* Profile Setup Overlay */}
      {showProfileWizard && (
        <div className="fixed inset-0 z-[100]">

          {/* Dark + Blur Background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          {/* Wizard */}
          <div className="relative z-[101] h-full">
            <ProfileSetupWizard />
          </div>

        </div>
      )}

    </div>
  );
};

export default DashboardLayout;

