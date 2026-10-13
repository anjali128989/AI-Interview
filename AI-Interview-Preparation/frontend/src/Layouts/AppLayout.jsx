import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AppLayout = () => {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#020617] text-white">
      <Sidebar />

      <main className="ml-[300px] h-full flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;