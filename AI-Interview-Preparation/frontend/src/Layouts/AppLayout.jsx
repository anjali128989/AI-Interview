import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AppLayout = () => (
  <div className="app-shell min-h-screen bg-[#020617] text-white">
    <Sidebar />
    <main className="app-main">
      <div className="app-main-content">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppLayout;
