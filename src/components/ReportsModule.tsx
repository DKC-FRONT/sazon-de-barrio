"use client";

import React from "react";
import { DianInvoice, RestaurantTable, ServiceRequest } from "@/lib/types";
import { formatCOP } from "@/lib/dian";
import { exportSalesToCsv } from "@/lib/store";
import { soundManager } from "@/lib/audio";

interface ReportsModuleProps {
  invoices: DianInvoice[];
  tables: RestaurantTable[];
  requests: ServiceRequest[];
  onResetData: () => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  invoices,
  tables,
  requests,
  onResetData,
}) => {
  // Cálculos financieros globales
  const totalSales = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalSubtotal = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  const totalTaxes = invoices.reduce((acc, inv) => acc + inv.taxAmount, 0);
  const totalTips = invoices.reduce((acc, inv) => acc + inv.tipAmount, 0);
  const invoiceCount = invoices.length;
  const averageTicket = invoiceCount > 0 ? Math.round(totalSales / invoiceCount) : 0;

  // Desglose por Medio de Pago
  const paymentBreakdown = invoices.reduce(
    (acc, inv) => {
      const pm = inv.paymentMethod || "efectivo";
      if (!acc[pm]) acc[pm] = 0;
      acc[pm] += inv.total;
      return acc;
    },
    {} as Record<string, number>
  );

  const cashTotal = paymentBreakdown["efectivo"] || 0;
  const cardTotal = paymentBreakdown["tarjeta"] || 0;
  const transferTotal =
    (paymentBreakdown["transferencia"] || 0) +
    (paymentBreakdown["nequi"] || 0) +
    (paymentBreakdown["daviplata"] || 0);

  // Rendimiento por Mesera
  const waitressPerformance = invoices.reduce(
    (acc, inv) => {
      const waiter = inv.waiterName || "Sin mesera";
      if (!acc[waiter]) {
        acc[waiter] = { count: 0, total: 0, tips: 0 };
      }
      acc[waiter].count += 1;
      acc[waiter].total += inv.total;
      acc[waiter].tips += inv.tipAmount;
      return acc;
    },
    {} as Record<string, { count: number; total: number; tips: number }>
  );

  // Ranking de Productos más Vendidos
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  invoices.forEach((inv) => {
    inv.items.forEach((it) => {
      if (!productSalesMap[it.name]) {
        productSalesMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
      }
      productSalesMap[it.name].qty += it.quantity;
      productSalesMap[it.name].revenue += it.total;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxProductQty = topProducts[0]?.qty || 1;

  const handleExportCsv = () => {
    soundManager.playTap();
    exportSalesToCsv(invoices);
  };

  const handlePrintCloseout = () => {
    soundManager.playTap();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header: Export CSV & Print Z */}
      <div className="bg-[#121B2D] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white">Cierre de Caja y Reportes Financieros</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Auditoría de turno en tiempo real · Fecha: {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <span>📥</span>
            <span>Exportar Cierre a Excel (.CSV)</span>
          </button>

          <button
            onClick={handlePrintCloseout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
          >
            <span>🖨️</span>
            <span>Imprimir Z de Cierre</span>
          </button>

          <button
            onClick={() => {
              if (confirm("¿Deseas restablecer los datos de prueba iniciales del restaurante?")) {
                onResetData();
              }
            }}
            className="px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-bold text-xs border border-rose-800/40 transition"
            title="Reiniciar datos iniciales"
          >
            🔄 Reset Demo
          </button>
        </div>
      </div>

      {/* 4 GRANDES METRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Total Vendido Turno</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {formatCOP(totalSales)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Subtotal neto: {formatCOP(totalSubtotal)}
          </span>
        </div>

        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Ticket Promedio</span>
          <div className="text-2xl sm:text-3xl font-black text-teal-300 mt-1">
            {formatCOP(averageTicket)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            En {invoiceCount} mesas atendidas
          </span>
        </div>

        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Propinas Recaudadas</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {formatCOP(totalTips)}
          </div>
          <span className="text-[11px] text-amber-300/80 mt-1 block">
            Para repartir al personal
          </span>
        </div>

        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Impoconsumo (8% DIAN)</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">
            {formatCOP(totalTaxes)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Liquidación fiscal automática
          </span>
        </div>
      </div>

      {/* DESGLOSE POR MEDIO DE PAGO & RENDIMIENTO MESERAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Medios de Pago */}
        <div className="bg-[#121B2D] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white">Ventas por Medio de Pago</h3>
            <span className="text-xs text-slate-400">Arqueo de Caja</span>
          </div>

          <div className="space-y-4">
            {/* Efectivo */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span>💵</span>
                  <span>Efectivo en Caja</span>
                </span>
                <span className="font-black text-emerald-400">{formatCOP(cashTotal)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: `${totalSales > 0 ? (cashTotal / totalSales) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Tarjeta Datáfono */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span>💳</span>
                  <span>Tarjetas / Datáfono</span>
                </span>
                <span className="font-black text-teal-400">{formatCOP(cardTotal)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{
                    width: `${totalSales > 0 ? (cardTotal / totalSales) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Transferencias Nequi/Daviplata */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span>📱</span>
                  <span>Transferencias (Nequi / Daviplata)</span>
                </span>
                <span className="font-black text-purple-400">{formatCOP(transferTotal)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{
                    width: `${totalSales > 0 ? (transferTotal / totalSales) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Control por Mesera */}
        <div className="bg-[#121B2D] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-white">Rendimiento por Mesera</h3>
            <span className="text-xs text-slate-400">Control de Propinas</span>
          </div>

          <div className="space-y-3">
            {Object.entries(waitressPerformance).map(([waiter, stats]) => (
              <div
                key={waiter}
                className="p-3 rounded-2xl bg-[#162137] border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-base">
                    👩‍🍳
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{waiter}</p>
                    <p className="text-[11px] text-slate-400">
                      {stats.count} {stats.count === 1 ? "mesa cobrada" : "mesas cobradas"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-emerald-400 text-sm">
                    {formatCOP(stats.total)}
                  </p>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Propina: {formatCOP(stats.tips)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTOS MAS VENDIDOS */}
      <div className="bg-[#121B2D] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white">Top 5 Platos y Bebidas Más Vendidos</h3>
          <span className="text-xs text-amber-400 font-bold">⭐ Preferidos del público</span>
        </div>

        <div className="space-y-3">
          {topProducts.map((prod, index) => {
            const pct = Math.round((prod.qty / maxProductQty) * 100);
            return (
              <div key={prod.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-black flex items-center justify-center text-[10px]">
                      #{index + 1}
                    </span>
                    <span>{prod.name}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-semibold">{prod.qty} unidades</span>
                    <span className="font-black text-emerald-400 font-mono">
                      {formatCOP(prod.revenue)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
