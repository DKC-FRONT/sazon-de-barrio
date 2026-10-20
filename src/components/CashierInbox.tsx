"use client";

import React from "react";
import { RestaurantTable, ServiceRequest, DianInvoice } from "@/lib/types";
import { formatCOP } from "@/lib/dian";
import { soundManager } from "@/lib/audio";

interface CashierInboxProps {
  tables: RestaurantTable[];
  requests: ServiceRequest[];
  invoices: DianInvoice[];
  onAttendRequest: (requestId: string) => void;
  onOpenCheckout: (table: RestaurantTable) => void;
  onRefreshSoundTest?: () => void;
}

export const CashierInbox: React.FC<CashierInboxProps> = ({
  tables,
  requests,
  invoices,
  onAttendRequest,
  onOpenCheckout,
}) => {
  // Contadores en tiempo real
  const totalSoldToday = invoices.reduce((acc, inv) => acc + inv.total, 0);

  const pendingTables = tables.filter((t) => t.status === "consumo" || t.status === "cuenta");
  const totalReceivable = pendingTables.reduce(
    (acc, t) => acc + (t.currentOrder?.total || 0),
    0
  );

  const activeTablesCount = pendingTables.length;
  const pendingRequests = requests.filter((r) => r.status === "pendiente");

  const getReasonBadge = (reason: ServiceRequest["reason"]) => {
    switch (reason) {
      case "solicitar_cuenta":
        return {
          icon: "🧾",
          text: "Cuenta Solicitada",
          cls: "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse",
        };
      case "corregir_cuenta":
        return {
          icon: "✏️",
          text: "Corregir Cuenta",
          cls: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        };
      case "cambio_plato":
        return {
          icon: "🔄",
          text: "Cambio de Plato",
          cls: "bg-teal-500/20 text-teal-300 border-teal-500/40",
        };
      case "ayuda":
        return {
          icon: "🙋",
          text: "Asistencia en Mesa",
          cls: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        };
    }
  };

  const getRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    if (mins === 0) return "Hace un momento";
    if (mins === 1) return "Hace 1 min";
    return `Hace ${mins} mins`;
  };

  return (
    <div className="space-y-6">
      {/* 4 CONTADORES EN TIEMPO REAL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Vendido Hoy */}
        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Vendido Hoy</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm">💰</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {formatCOP(totalSoldToday)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {invoices.length} facturas emitidas
          </div>
        </div>

        {/* Por Cobrar */}
        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Por Cobrar</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 text-sm">⏳</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
            {formatCOP(totalReceivable)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            En {pendingTables.length} mesas activas
          </div>
        </div>

        {/* Mesas Activas */}
        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mesas Activas</span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 text-sm">🍽️</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeTablesCount}{" "}
            <span className="text-sm font-normal text-slate-500">/ {tables.length}</span>
          </div>
          <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            {Math.round((activeTablesCount / (tables.length || 1)) * 100)}% de ocupación
          </div>
        </div>

        {/* Alertas de Cuenta */}
        <div
          className={`border rounded-2xl p-4 relative overflow-hidden shadow-lg transition-all ${
            pendingRequests.length > 0
              ? "bg-red-950/20 border-red-500/50 shadow-red-500/10"
              : "bg-[#121B2D] border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Alertas Pendientes</span>
            <span
              className={`p-2 rounded-xl text-sm ${
                pendingRequests.length > 0
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              🔔
            </span>
          </div>
          <div
            className={`mt-2 text-xl sm:text-2xl font-black tracking-tight ${
              pendingRequests.length > 0 ? "text-red-400" : "text-slate-300"
            }`}
          >
            {pendingRequests.length}{" "}
            <span className="text-xs font-normal text-slate-400">solicitudes</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            {pendingRequests.length > 0 ? (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                Requiere atención de caja
              </span>
            ) : (
              <span className="text-slate-500">Sin demoras activas</span>
            )}
          </div>
        </div>
      </div>

      {/* BANDEJA EN TIEMPO REAL */}
      <div className="bg-[#121B2D] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Bandeja de Entrada de Solicitudes</h2>
              {pendingRequests.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500 text-white animate-pulse">
                  {pendingRequests.length} NUEVAS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Notificaciones instantáneas enviadas por las meseras desde el salón
            </p>
          </div>
          <button
            onClick={() => soundManager.playBillRequested()}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-950/30 text-teal-300 text-xs font-semibold hover:bg-teal-900/40 transition"
          >
            <span>🔔 Probar Sonido de Alerta</span>
          </button>
        </div>

        {/* LISTA DE SOLICITUDES */}
        <div className="mt-4 space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-[#0E1524]">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-sm sm:text-base font-bold text-slate-200">
                Bandeja al día: no hay solicitudes pendientes
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Cuando una mesera pida la cuenta o solicite corregir un pedido en el salón, sonará una campanilla suave y aparecerá aquí inmediatamente.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => {
              const badge = getReasonBadge(req.reason);
              const relatedTable = tables.find((t) => t.id === req.tableId);
              const tableTotal = relatedTable?.currentOrder?.total || 0;

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    req.reason === "solicitar_cuenta"
                      ? "bg-[#181D33] border-red-500/50 shadow-md shadow-red-500/10 animate-soft-pulse"
                      : "bg-[#151E33] border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#0F1626] border border-slate-700 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Mesa</span>
                        <span className="text-lg font-black text-amber-400 leading-none">
                          {req.tableId}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-white">
                            {req.tableName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.cls}`}
                          >
                            <span>{badge.icon}</span>
                            <span>{badge.text}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            · {getRelativeTime(req.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                          <span className="font-medium text-amber-300">
                            👩‍🍳 {req.waiterName}
                          </span>
                          {req.quickNote && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                              📝 {req.quickNote}
                            </span>
                          )}
                        </div>
                        {tableTotal > 0 && (
                          <div className="text-xs font-bold text-emerald-400 mt-1">
                            Saldo en mesa: {formatCOP(tableTotal)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          soundManager.playTap();
                          onAttendRequest(req.id);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
                      >
                        ✓ Descartar
                      </button>
                      {relatedTable && (
                        <button
                          onClick={() => {
                            soundManager.playTap();
                            onAttendRequest(req.id);
                            onOpenCheckout(relatedTable);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-teal-600/30 flex items-center gap-1.5 transition active:scale-95"
                        >
                          <span>💳 Cobrar Mesa #{req.tableId}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
