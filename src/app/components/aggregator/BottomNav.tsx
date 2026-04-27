"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Map,
  AlertTriangle,
} from "lucide-react";
import "./BottomNav.css";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={22} /> },
  { id: "entities", label: "Entities", icon: <Building2 size={22} /> },
  { id: "map", label: "Peta", icon: <Map size={22} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={22} /> },
  { id: "triage", label: "Triage", icon: <AlertTriangle size={22} /> },
];

export default function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (t: TabId) => void;
}) {
  return (
    <nav className="bottom-nav glass-strong">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => onTabChange(t.id)}
            aria-label={t.label}
          >
            <div className="nav-icon-wrap">
              {t.icon}
              {isActive && <div className="nav-glow" />}
            </div>
            <span className="nav-label">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
