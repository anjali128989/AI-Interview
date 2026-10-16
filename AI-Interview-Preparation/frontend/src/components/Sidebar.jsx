import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  BarChart3,
  History,
  LifeBuoy,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Analyzer", path: "/ResumeAnalyzer", icon: FileText },
  { name: "Interview", path: "/interview", icon: Mic },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "History", path: "/history", icon: History },
  { name: "Support", path: "/support", icon: LifeBuoy },
];

const Sidebar = () => {
  const { user } = useAuth();
  const displayName = user?.name || user?.displayName || user?.email || "Guest";

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <div className="app-sidebar-logo">
        <img src="/logo.png" alt="AI Interview Prep Logo" />
        <h1>AI-InterviewPrep</h1>
      </div>

      <nav className="app-sidebar-nav" aria-label="Main menu">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            title={name}
            aria-label={name}
            className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}
          >
            <Icon size={20} aria-hidden="true" />
            <span className="app-nav-label">{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar-user">
        <p>Logged in as</p>
        <h2 title={displayName}>{displayName}</h2>
      </div>
    </aside>
  );
};

export default Sidebar;
