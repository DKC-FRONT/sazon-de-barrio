"use client";

import React, { useState } from "react";
import { DianInvoice } from "@/lib/types";
import { formatCOP, buildWhatsAppInvoiceUrl } from "@/lib/dian";
import { soundManager } from "@/lib/audio";

interface DianInvoicesModuleProps {
  invoices: DianInvoice[];
}

export const DianInvoicesModule: React.FC<DianInvoicesModuleProps> = ({ invoices }) => {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<DianInvoice | null>(invoices[0] || null);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customer.businessName.toLowerCase().includes(q) ||
      inv.customer.documentNumber.includes(q) ||
      inv.cufe.toLowerCase().includes(q) ||
      inv.tableName.toLowerCase().includes(q)
    );
  });

  const totalDianAmount = invoices.reduce((acc, inv) => acc + inv.total, 0);

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400">Total Facturado DIAN</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {formatCOP(totalDianAmount)}
          </div>
          <span className="text-[11px] text-slate-400">100% transmitidas y validadas</span>
        </div>

        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400">Comprobantes Electrónicos</span>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {invoices.length}
          </div>
          <span className="text-[11px] text-teal-400">Rango SETP habilitado</span>
        </div>

        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400">Estado DIAN Web Service</span>
          <div className="text-xl sm:text-2xl font-black text-teal-300 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Operativo
          </div>
          <span className="text-[11px] text-slate-400">Anexo Técnico 1.8 UBL 2.1</span>
        </div>
      </div>

      {/* Main Container: Split View List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Invoice List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por factura, cliente, NIT o CUFE..."
              className="w-full bg-[#182338] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-[#121B2D] rounded-2xl border border-slate-800 p-4">
                No se encontraron facturas con ese criterio.
              </div>
            ) : (
              filtered.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      setSelectedInvoice(inv);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-[#18253D] border-teal-500/60 shadow-lg shadow-teal-500/10 scale-101"
                        : "bg-[#121B2D] border-slate-800 hover:bg-[#152033]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-white">
                            {inv.invoiceNumber}
                          </span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ {inv.dianStatus}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-300 mt-1 line-clamp-1">
                          {inv.customer.businessName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {inv.customer.documentType} {inv.customer.documentNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400">
                          {formatCOP(inv.total)}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1 capitalize">
                          {inv.tableName}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Invoice Detail Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInvoice ? (
            <div className="bg-[#121B2D] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <h3 className="text-lg font-black text-white">{selectedInvoice.invoiceNumber}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950">
                      DIAN Aprobada
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Emitida el {new Date(selectedInvoice.issuedAt).toLocaleString("es-CO")} · {selectedInvoice.tableName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppInvoiceUrl(selectedInvoice.customer.phone, {
                      invoiceNumber: selectedInvoice.invoiceNumber,
                      customerName: selectedInvoice.customer.businessName,
                      total: selectedInvoice.total,
                      cufe: selectedInvoice.cufe,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>💬</span>
                    <span>Reenviar WhatsApp</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                  >
                    🖨️ Imprimir
                  </button>
                </div>
              </div>

              {/* CUFE Box */}
              <div className="bg-[#0C1220] border border-slate-800 p-3.5 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Código Único de Factura Electrónica (CUFE):
                </span>
                <p className="font-mono text-xs text-teal-300 break-all select-all leading-relaxed">
                  {selectedInvoice.cufe}
                </p>
              </div>

              {/* Customer and Items Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#162137] p-4 rounded-2xl border border-slate-700/60 text-xs space-y-1.5">
                  <span className="font-bold text-teal-400 uppercase text-[10px] tracking-wider block mb-1">
                    Datos del Adquirente
                  </span>
                  <p className="text-white font-bold text-sm">{selectedInvoice.customer.businessName}</p>
                  <p className="text-slate-300">
                    Doc: {selectedInvoice.customer.documentType} {selectedInvoice.customer.documentNumber}
                    {selectedInvoice.customer.dv ? `-${selectedInvoice.customer.dv}` : ""}
                  </p>
                  <p className="text-slate-300">Email: {selectedInvoice.customer.email}</p>
                  <p className="text-slate-300">Tel: {selectedInvoice.customer.phone}</p>
                  <p className="text-slate-300">
                    Régimen: {selectedInvoice.customer.taxRegime === "48" ? "Responsable IVA" : "No Responsable"}
                  </p>
                </div>

                <div className="bg-[#162137] p-4 rounded-2xl border border-slate-700/60 text-xs space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-teal-400 uppercase text-[10px] tracking-wider block mb-1">
                      Medio de Pago & Liquidación
                    </span>
                    <p className="text-white font-bold capitalize text-sm">{selectedInvoice.paymentMethod}</p>
                    <p className="text-slate-400">Atendido por: {selectedInvoice.waiterName}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span>{formatCOP(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Impoconsumo (8%):</span>
                      <span>{formatCOP(selectedInvoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Propina voluntaria:</span>
                      <span>{formatCOP(selectedInvoice.tipAmount)}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-emerald-400 pt-1 border-t border-slate-700">
                      <span>TOTAL:</span>
                      <span>{formatCOP(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-[#141E33] border border-slate-800 rounded-2xl p-4">
                <span className="font-bold text-slate-300 text-xs uppercase tracking-wider block mb-2.5">
                  Líneas de Factura ({selectedInvoice.items.length} ítems)
                </span>
                <div className="space-y-2">
                  {selectedInvoice.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                          {it.quantity}x
                        </span>
                        <span className="text-white font-medium">{it.name}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatCOP(it.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 bg-[#121B2D] border border-slate-800 rounded-3xl text-center text-slate-500 text-sm">
              Selecciona una factura de la izquierda para ver su CUFE, QR y detalle DIAN.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
