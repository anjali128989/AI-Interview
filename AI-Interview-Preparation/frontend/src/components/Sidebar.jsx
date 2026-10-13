
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  BarChart3,
  History,
  LifeBuoy,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />
    },
    {
      name: "Resume Analyzer",
      path: "/ResumeAnalyzer",
      icon: <FileText size={20} />
    },
    {
      name: "Interview",
      path: "/interview",
      icon: <Mic size={20} />
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <BarChart3 size={20} />
    },
    {
      name: "History",
      path: "/history",
      icon: <History size={20} />
    },
    {
      name: "Support",
      path: "/support",
      icon: <LifeBuoy size={20} />
    }
  ];

  const displayName =
    user?.name ||
    user?.displayName ||
    user?.email ||
    "Guest";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] border-r border-white/10 flex flex-col z-50">
      {/* Logo */}
      <div className="h-20 flex items-center justify-center gap-3 border-b border-white/10 px-4">
        <img
          src="/logo.png"
          alt="AI Interview Prep Logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-xl font-bold text-white tracking-wide">
          AI-InterviewPrep
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
              ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-sm text-gray-400">
            Logged in as
          </p>
          <h2 className="text-white font-semibold break-words">
            {displayName}
          </h2>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;