"use client";

import React, { useState } from "react";
import { RestaurantTable, ServiceRequest, UserProfile } from "@/lib/types";
import { soundManager } from "@/lib/audio";

interface WaitressRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTable[];
  selectedTableId?: number;
  currentUser: UserProfile;
  onSubmitRequest: (request: Omit<ServiceRequest, "id" | "createdAt" | "status">) => void;
}

export const WaitressRequestModal: React.FC<WaitressRequestModalProps> = ({
  isOpen,
  onClose,
  tables,
  selectedTableId,
  currentUser,
  onSubmitRequest,
}) => {
  const [tableId, setTableId] = useState<number>(selectedTableId || 1);
  const [reason, setReason] = useState<ServiceRequest["reason"]>("solicitar_cuenta");
  const [quickNote, setQuickNote] = useState<string>("Paga con Nequi · Propina 10%");
  const [customNote, setCustomNote] = useState<string>("");

  if (!isOpen) return null;

  const quickChips = [
    "📱 Paga con Nequi",
    "💵 Efectivo exacto",
    "💳 Paga con Tarjeta",
    "👥 Dividir en 2 cuentas",
    "👥 Dividir en 3 cuentas",
    "⭐ Con propina 10%",
    "🚫 Sin propina",
    "⚡ Cliente con prisa",
    "✏️ Corregir plato / ítem",
  ];

  const reasons = [
    {
      id: "solicitar_cuenta" as const,
      label: "Solicitar Cuenta",
      icon: "🧾",
      desc: "Mesa lista para facturación y cobro",
      color: "border-red-500/50 bg-red-950/30 text-red-200",
      activeColor: "ring-2 ring-red-500 bg-red-900/40 text-white",
    },
    {
      id: "corregir_cuenta" as const,
      label: "Corregir Cuenta",
      icon: "✏️",
      desc: "Modificar ítems, platos o descuentos",
      color: "border-amber-500/50 bg-amber-950/30 text-amber-200",
      activeColor: "ring-2 ring-amber-500 bg-amber-900/40 text-white",
    },
    {
      id: "cambio_plato" as const,
      label: "Cambio o Anulación",
      icon: "🔄",
      desc: "Plato devuelto o cambio de orden",
      color: "border-teal-500/50 bg-teal-950/30 text-teal-200",
      activeColor: "ring-2 ring-teal-500 bg-teal-900/40 text-white",
    },
    {
      id: "ayuda" as const,
      label: "Llamar a Caja / Gerente",
      icon: "🙋",
      desc: "Asistencia presencial urgente en mesa",
      color: "border-blue-500/50 bg-blue-950/30 text-blue-200",
      activeColor: "ring-2 ring-blue-500 bg-blue-900/40 text-white",
    },
  ];

  const handleSend = () => {
    soundManager.playTap();
    const finalNote = [quickNote, customNote.trim()].filter(Boolean).join(" · ");
    const targetTable = tables.find((t) => t.id === tableId);
    onSubmitRequest({
      tableId,
      tableName: targetTable?.name || `Mesa ${tableId}`,
      waiterName: currentUser.name,
      reason,
      quickNote: finalNote || "Solicitud de cuenta general",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#141E33] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              ⚡
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Envío Rápido a Caja (3 Toques)
              </h2>
              <p className="text-xs text-slate-400">
                Notificación en tiempo real a la pantalla de la cajera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Content with 3 Toque steps */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* TOQUE 1: Motivo */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Toque 1: Motivo de la solicitud
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {reasons.map((r) => {
                const isSelected = reason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      setReason(r.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected ? r.activeColor : `${r.color} hover:bg-slate-800/80`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{r.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="font-bold text-xs sm:text-sm text-white">{r.label}</p>
                      <p className="text-[10px] text-slate-300 opacity-80 mt-0.5 line-clamp-1">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOQUE 2: Mesa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Toque 2: Selecciona la Mesa
                </label>
              </div>
              <span className="text-xs text-amber-400 font-bold">
                Mesa elegida: #{tableId}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {tables.map((t) => {
                const isSelected = tableId === t.id;
                const isCuenta = t.status === "cuenta";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      setTableId(t.id);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-[#00A6A6] text-white border-teal-300 shadow-md shadow-teal-500/30 scale-105"
                        : isCuenta
                        ? "bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/50"
                        : "bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <div>#{t.id}</div>
                    <div className="text-[9px] font-normal opacity-70 truncate">{t.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOQUE 3: Observación Rápida con Chips */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center">
                3
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Toque 3: Notas de pago / Observación rápida
              </label>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {quickChips.map((chip) => {
                const isSelected = quickNote === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      setQuickNote(chip);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm shadow-amber-500/30 scale-105"
                        : "bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="O escribe nota extra (ej. Mesa quiere factura con NIT)..."
              className="w-full bg-[#182338] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#141E33] border-t border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-700 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>🚀 Enviar a Caja Inmediatamente</span>
          </button>
        </div>
      </div>
    </div>
  );
};
