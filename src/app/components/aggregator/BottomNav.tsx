"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Map,
  AlertTriangle,
  FileEdit
} from "lucide-react";
import "./BottomNav.css";

export type TabId = "dashboard" | "entities" | "analytics" | "map" | "triage" | "input-data";

// MANTRA BARU: Kita masukin kasta 'admin' ke semua akses VVIP!
const allTabs: { id: TabId; label: string; icon: React.ReactNode; roles: string[] }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={22} />, roles: ['user', 'aggregator_member', 'aggregator_it', 'developer', 'admin'] },
  { id: "entities", label: "Entities", icon: <Building2 size={22} />, roles: ['user', 'aggregator_member', 'aggregator_it', 'developer', 'admin'] },
  { id: "map", label: "Peta", icon: <Map size={22} />, roles: ['user', 'aggregator_member', 'aggregator_it', 'developer', 'admin'] },
  { id: "input-data", label: "Input", icon: <FileEdit size={22} />, roles: ['aggregator_member', 'aggregator_it', 'developer', 'admin'] },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={22} />, roles: ['aggregator_it', 'developer', 'admin'] },
  { id: "triage", label: "Triage", icon: <AlertTriangle size={22} />, roles: ['aggregator_it', 'developer', 'admin'] },
];

export default function BottomNav({
  activeTab,
  onTabChange,
  userRole = "user"
}: {
  activeTab: TabId;
  onTabChange: (t: TabId) => void;
  userRole?: string;
}) {
  const currentRole = userRole?.toLowerCase() || 'user';
  const visibleTabs = allTabs.filter(t => t.roles.includes(currentRole));

  // ANTI-AKUARIUM: Kalau gak ada tombol sama sekali, sembunyikan kotak kacanya!
  if (visibleTabs.length === 0) return null;

  return (
    <nav className="bottom-nav glass-strong">
      {visibleTabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => onTabChange(t.id)}
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