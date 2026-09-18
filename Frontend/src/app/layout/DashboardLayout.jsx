import React from "react";
import { Outlet } from "react-router-dom";
import UpperNavbar from "../../components/Dashboard/UpperNavbar"; // adjust to your actual path
import Sidebar from "../../components/Dashboard/Sidebar"; // adjust to your actual path

const DashboardLayout = () => {
return (
    <div className="flex flex-col h-screen bg-background">
      {/* Navbar - always full width across the top */}
      <UpperNavbar />
 
      {/* Below navbar: sidebar (full height, no scroll) + scrollable content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
 
        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;