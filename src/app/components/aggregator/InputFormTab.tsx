"use client";

import React, { useState } from "react";
import { Building2, RefreshCw, ChevronRight, CalendarDays, ClipboardList } from "lucide-react";
import BMCRegistrationForm from "./BMCRegistrationForm";
import PeriodicUpdateForm from "./PeriodicUpdateForm";
import "./InputFormTab.css";

type Mode = "hub" | "bmc" | "periodic";

export default function InputFormTab({ session }: { session?: any }) {
  const [mode, setMode] = useState<Mode>("hub");

  // Oper session ke komponen anak biar bisa nembak ke Supabase
  if (mode === "bmc") return <BMCRegistrationForm session={session} onBack={() => setMode("hub")} />;
  if (mode === "periodic") return <PeriodicUpdateForm session={session} onBack={() => setMode("hub")} />;

  return (
    <div className="hub-screen">
      <div className="hub-header anim-fade">
        <ClipboardList size={28} className="hub-header-icon" />
        <h1 className="hub-title">Form Input</h1>
        <p className="hub-subtitle">Pilih jenis formulir yang ingin diisi</p>
      </div>

      <button className="hub-card anim-slide d1" onClick={() => setMode("bmc")} type="button">
        <div className="hub-card-icon" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}><Building2 size={22} /></div>
        <div className="hub-card-body">
          <h3 className="hub-card-title">Registrasi Bisnis</h3>
          <p className="hub-card-desc">Daftar bisnis baru ke agregator. Mengisi 11 langkah profil & 9 blok BMC lengkap.</p>
        </div>
        <ChevronRight size={18} className="hub-card-arrow" />
      </button>

      <button className="hub-card anim-slide d2" onClick={() => setMode("periodic")} type="button">
        <div className="hub-card-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}><RefreshCw size={22} /></div>
        <div className="hub-card-body">
          <h3 className="hub-card-title">Update Periodik</h3>
          <p className="hub-card-desc">Update kondisi bisnis bulanan atau triwulanan. Kinerja keuangan, operasional & kesehatan.</p>
        </div>
        <ChevronRight size={18} className="hub-card-arrow" />
      </button>
    </div>
  );
}