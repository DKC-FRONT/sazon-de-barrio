"use client";

import React, { useState } from "react";
import { UserProfile, Role } from "@/lib/types";
import { DEMO_USERS } from "@/lib/store";
import { soundManager } from "@/lib/audio";

interface NavbarProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingRequestsCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  activeTab,
  onSelectTab,
  pendingRequestsCount,
  onLogout,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(() => soundManager.isEnabled());
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const toggleAudio = () => {
    const next = !audioEnabled;
    soundManager.setEnabled(next);
    setAudioEnabled(next);
    if (next) {
      soundManager.playTap();
    }
  };

  const navItems = [
    { id: "mesas", label: "Mesas & Salón", icon: "🍽️", roles: ["mesera", "caja", "admin"] },
    {
      id: "inbox",
      label: "Bandeja Caja",
      icon: "🔔",
      roles: ["caja", "admin"],
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    { id: "pos", label: "POS Rápido", icon: "⚡", roles: ["mesera", "caja", "admin"] },
    { id: "dian", label: "Facturas DIAN", icon: "🏛️", roles: ["caja", "admin"] },
    { id: "reportes", label: "Cierre & Reportes", icon: "📊", roles: ["caja", "admin"] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const roleColors: Record<Role, { badge: string; border: string; glow: string }> = {
    mesera: {
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      border: "border-amber-500/50",
      glow: "shadow-amber-500/10",
    },
    caja: {
      badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      border: "border-teal-500/50",
      glow: "shadow-teal-500/10",
    },
    admin: {
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      border: "border-purple-500/50",
      glow: "shadow-purple-500/10",
    },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E1524]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00A6A6] to-[#0D9488] flex items-center justify-center text-xl shadow-lg shadow-[#00A6A6]/20 border border-teal-400/30">
              🥘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Sazón de Barrio
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                POS · DIAN UBL 2.1 · Multi-Rol
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#131B2E] p-1 rounded-xl border border-slate-800">
            {visibleNav.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    active
                      ? "bg-[#00A6A6] text-white shadow-md shadow-[#00A6A6]/30 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        active
                          ? "bg-red-500 text-white animate-bounce"
                          : "bg-red-500/90 text-white animate-pulse"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Audio Toggle + Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              title={audioEnabled ? "Alertas sonoras activas" : "Alertas sonoras silenciadas"}
              className={`p-2 rounded-xl text-sm border transition-all ${
                audioEnabled
                  ? "bg-teal-950/40 border-teal-500/40 text-teal-300 hover:bg-teal-900/50"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {audioEnabled ? "🔔" : "🔕"}
            </button>

            {/* Quick Role Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border bg-[#131B2E] text-xs font-medium hover:border-slate-600 transition-all ${
                  roleColors[currentUser.role].border
                }`}
              >
                <span className="text-base">{currentUser.avatar}</span>
                <div className="text-left hidden sm:block">
                  <div className="text-white font-semibold text-xs leading-none">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{currentUser.role}</div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    roleColors[currentUser.role].badge
                  }`}
                >
                  {currentUser.role}
                </span>
                <svg className="w-3.5 h-3.5 text-slate-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Role Dropdown Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-[#141D30] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-700/60">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Cambiar Rol en 1 Clic
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Prueba multi-pestaña o multi-usuario
                    </p>
                  </div>
                  <div className="py-1 space-y-1">
                    {DEMO_USERS.map((user) => {
                      const isCurrent = user.id === currentUser.id;
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSwitchUser(user);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                            isCurrent
                              ? "bg-[#00A6A6]/20 border border-[#00A6A6]/50 text-white font-bold"
                              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{user.avatar}</span>
                            <div className="text-left">
                              <p className="font-semibold text-white leading-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-teal-400 text-xs font-bold">✓ Activo</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between px-2">
                    <span className="text-[10px] text-slate-400">Contraseña demo: demo123</span>
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 py-1 px-2 rounded-lg hover:bg-rose-950/40 transition"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Bar */}
      <div className="lg:hidden border-t border-slate-800/70 bg-[#0B101C] px-2 py-1.5 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {visibleNav.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? "bg-[#00A6A6] text-white shadow-md shadow-[#00A6A6]/30 font-bold"
                  : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
