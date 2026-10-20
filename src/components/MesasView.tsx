"use client";

import React, { useState } from "react";
import { RestaurantTable, TableStatus, UserProfile } from "@/lib/types";
import { formatCOP } from "@/lib/dian";
import { soundManager } from "@/lib/audio";

interface MesasViewProps {
  tables: RestaurantTable[];
  currentUser: UserProfile;
  onRequestBill: (tableId: number) => void;
  onOpenOrder: (table: RestaurantTable) => void;
  onOpenCheckout: (table: RestaurantTable) => void;
  onFreeTable: (tableId: number) => void;
}

export const MesasView: React.FC<MesasViewProps> = ({
  tables,
  currentUser,
  onRequestBill,
  onOpenOrder,
  onOpenCheckout,
  onFreeTable,
}) => {
  const [filter, setFilter] = useState<TableStatus | "all">("all");

  const statusStyles: Record<
    TableStatus,
    { label: string; bg: string; border: string; chip: string; icon: string }
  > = {
    libre: {
      label: "Libre",
      bg: "bg-[#101726]/80 hover:bg-[#141E33]",
      border: "border-slate-800 hover:border-slate-700",
      chip: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      icon: "🟢",
    },
    consumo: {
      label: "En Consumo",
      bg: "bg-[#151E33]/90 hover:bg-[#18233C]",
      border: "border-amber-500/40 hover:border-amber-500/60 shadow-lg shadow-amber-500/5",
      chip: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: "🍽️",
    },
    cuenta: {
      label: "Pidió la Cuenta",
      bg: "bg-[#1D1624] hover:bg-[#251A30]",
      border: "border-red-500/60 shadow-lg shadow-red-500/15 animate-soft-pulse",
      chip: "bg-red-500 text-white font-black animate-pulse",
      icon: "🧾",
    },
    pagada: {
      label: "Pagada / Por Limpiar",
      bg: "bg-[#101D24]/90 hover:bg-[#132530]",
      border: "border-teal-500/40 hover:border-teal-500/60",
      chip: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      icon: "✨",
    },
  };

  const filteredTables = tables.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const countByStatus = {
    all: tables.length,
    libre: tables.filter((t) => t.status === "libre").length,
    consumo: tables.filter((t) => t.status === "consumo").length,
    cuenta: tables.filter((t) => t.status === "cuenta").length,
    pagada: tables.filter((t) => t.status === "pagada").length,
  };

  return (
    <div className="space-y-5">
      {/* Top Bar with Filter Pills & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111828] p-3 rounded-2xl border border-slate-800">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: "all" as const, label: "Todas", count: countByStatus.all },
            { id: "consumo" as const, label: "En Consumo", count: countByStatus.consumo },
            { id: "cuenta" as const, label: "Pidieron Cuenta", count: countByStatus.cuenta },
            { id: "libre" as const, label: "Libres", count: countByStatus.libre },
            { id: "pagada" as const, label: "Pagadas", count: countByStatus.pagada },
          ].map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playTap();
                  setFilter(item.id);
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#00A6A6] text-white shadow-md shadow-teal-500/30"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Floating Quick Action Button: Pedir Cuenta */}
        <button
          onClick={() => {
            soundManager.playTap();
            onRequestBill(1);
          }}
          className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition active:scale-95"
        >
          <span>⚡</span>
          <span>Pedir Cuenta en 3 Toques</span>
        </button>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredTables.map((table) => {
          const style = statusStyles[table.status];
          const hasOrder = table.currentOrder && table.currentOrder.items.length > 0;
          const orderTotal = table.currentOrder?.total || 0;

          return (
            <div
              key={table.id}
              className={`rounded-3xl border p-4 flex flex-col justify-between transition-all duration-200 ${style.bg} ${style.border}`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-white tracking-tight">
                      {table.name}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${style.chip}`}
                  >
                    <span>{style.icon}</span>
                    <span>{style.label}</span>
                  </span>
                </div>

                {/* Subtitle / Waiter */}
                <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
                  <span>Cap: {table.capacity} personas</span>
                  <span className="font-medium text-slate-300 truncate max-w-[120px]">
                    {table.waiterName ? `👩‍🍳 ${table.waiterName}` : "Sin mesera"}
                  </span>
                </div>

                {/* Order Summary or Notice */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  {hasOrder ? (
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] text-slate-400">Total acumulado:</span>
                        <span className="text-base font-black text-emerald-400">
                          {formatCOP(orderTotal)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {table.currentOrder?.items.length} ítems en comanda
                      </p>
                      {table.lastRequest?.status === "pendiente" && (
                        <div className="mt-2 px-2 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-[11px] text-red-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                          <span className="truncate">🔔 {table.lastRequest.quickNote}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-2 text-center text-xs text-slate-400">
                      {table.status === "libre" ? "Mesa disponible para comensales" : "Mesa lista"}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons depending on Table State */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col gap-1.5">
                {table.status === "libre" && (
                  <button
                    onClick={() => {
                      soundManager.playTap();
                      onOpenOrder(table);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition"
                  >
                    + Tomar Pedido POS
                  </button>
                )}

                {table.status === "consumo" && (
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        soundManager.playTap();
                        onOpenOrder(table);
                      }}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                    >
                      + Agregar
                    </button>
                    <button
                      onClick={() => {
                        soundManager.playTap();
                        onRequestBill(table.id);
                      }}
                      className="py-2 px-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/30 transition"
                    >
                      🧾 Pedir Cuenta
                    </button>
                  </div>
                )}

                {table.status === "cuenta" && (
                  <div className="flex flex-col gap-1.5">
                    {(currentUser.role === "caja" || currentUser.role === "admin") && (
                      <button
                        onClick={() => {
                          soundManager.playTap();
                          onOpenCheckout(table);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-teal-600/30 transition"
                      >
                        💳 Cobrar Mesa Ahora
                      </button>
                    )}
                    <button
                      onClick={() => {
                        soundManager.playTap();
                        onRequestBill(table.id);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                    >
                      ✏️ Reenviar / Corregir
                    </button>
                  </div>
                )}

                {table.status === "pagada" && (
                  <button
                    onClick={() => {
                      soundManager.playTap();
                      onFreeTable(table.id);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-950/50 hover:border-emerald-500/40 text-slate-200 font-bold text-xs border border-slate-700 transition"
                  >
                    🧹 Liberar Mesa (Limpia)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
