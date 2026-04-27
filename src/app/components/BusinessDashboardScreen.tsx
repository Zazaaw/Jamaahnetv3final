import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

// Manggil file-file original buatan Om dari folder aggregator
import DashboardTab from "./aggregator/DashboardTab";
import PortfolioTab from "./aggregator/PortfolioTab";
import AnalyticsTab from "./aggregator/AnalyticsTab";
import TriageTab from "./aggregator/TriageTab";
import MapTab from "./aggregator/MapTab";
import BottomNav from "./aggregator/BottomNav";
import "./aggregator/aggregator-global.css";

// Ekspor tipe TabId biar file Om (DashboardTab & BottomNav) ga error
export type TabId = "dashboard" | "entities" | "analytics" | "map" | "triage";

export default function BusinessDashboardScreen({ 
  session, 
  onBack 
}: { 
  session?: any;
  onBack: () => void; 
}) {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="aggregator-wrapper" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      
      {/* Tombol Back khas Jamaah.net */}
      <div style={{ position: 'sticky', top: 0, zIndex: 999, padding: '16px', background: 'rgba(11, 17, 32, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={onBack} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ marginLeft: '12px' }}>
          <p style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Divisi Ekonomi</p>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Pusat Komando</h1>
        </div>
      </div>

      {/* Konten Tab Original Om */}
      <div className="app-container" style={{ paddingBottom: 'calc(var(--nav-height) + 20px)' }}>
        {activeTab === "dashboard" && <DashboardTab onNavigate={setActiveTab as any} />}
        {activeTab === "entities" && <PortfolioTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "map" && <MapTab />}
        {activeTab === "triage" && <TriageTab />}
      </div>

      {/* Bottom Nav Original Om */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab as any} />
    </div>
  );
}