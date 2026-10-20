"use client";

import React, { useState } from "react";
import {
  RestaurantTable,
  CartItem,
  PaymentMethod,
  DocumentType,
  DianCustomer,
  DianInvoice,
  UserProfile,
} from "@/lib/types";
import { formatCOP, calculateNitDv, generateCufe, buildWhatsAppInvoiceUrl } from "@/lib/dian";
import { soundManager } from "@/lib/audio";

interface CheckoutDianModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTable;
  items: CartItem[];
  tipPercentage: number;
  currentUser: UserProfile;
  onInvoiceCreated: (invoice: DianInvoice) => void;
}

export const CheckoutDianModal: React.FC<CheckoutDianModalProps> = ({
  isOpen,
  onClose,
  table,
  items,
  tipPercentage,
  currentUser,
  onInvoiceCreated,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [voucherNumber, setVoucherNumber] = useState("");
  const [transferPlatform, setTransferPlatform] = useState<"nequi" | "daviplata" | "bancolombia">("nequi");
  const [transferRef, setTransferRef] = useState("");

  // Tipo de comprobante
  const [isDianInvoice, setIsDianInvoice] = useState<boolean>(true);

  // Datos del Adquirente / Cliente DIAN
  const [documentType, setDocumentType] = useState<DocumentType>("CC");
  const [documentNumber, setDocumentNumber] = useState<string>("1020304050");
  const [businessName, setBusinessName] = useState<string>("Cliente General");
  const [customerEmail, setCustomerEmail] = useState<string>("cliente@correo.com");
  const [customerPhone, setCustomerPhone] = useState<string>("3101234567");
  const [taxRegime, setTaxRegime] = useState<"48" | "49">("49");
  const [city, setCity] = useState<string>("Bogotá D.C.");

  // Estados de validación DIAN
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionStep, setTransmissionStep] = useState<string>("");
  const [generatedInvoice, setGeneratedInvoice] = useState<DianInvoice | null>(null);
  const [copiedCufe, setCopiedCufe] = useState(false);

  if (!isOpen) return null;

  // Totales
  const subtotal = items.reduce((acc, it) => acc + (it.customPrice ?? it.menuItem.price) * it.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.08); // Impoconsumo 8%
  const tipAmount = Math.round(subtotal * (tipPercentage / 100));
  const total = subtotal + taxAmount + tipAmount;

  // Devuelta en efectivo
  const effectiveReceived = amountReceived || total;
  const changeAmount = Math.max(0, effectiveReceived - total);
  const missingAmount = Math.max(0, total - (amountReceived || 0));

  // Dígito de verificación si es NIT
  const dv = documentType === "NIT" ? calculateNitDv(documentNumber) : undefined;

  // Llenar plantilla consumidor final
  const handleSelectConsumerType = (type: "final" | "persona" | "empresa") => {
    if (type === "final") {
      setDocumentType("CF");
      setDocumentNumber("222222222222");
      setBusinessName("Consumidor Final");
      setCustomerEmail("ventas@sazonbarrio.com");
      setTaxRegime("49");
    } else if (type === "empresa") {
      setDocumentType("NIT");
      setDocumentNumber("901458923");
      setBusinessName("Restaurantes & Alimentos de Colombia S.A.S.");
      setCustomerEmail("facturacion@alimentoscolombia.co");
      setTaxRegime("48");
    } else {
      setDocumentType("CC");
      setDocumentNumber("1032489120");
      setBusinessName("Juan Carlos Pérez");
      setCustomerEmail("juan.perez@gmail.com");
      setTaxRegime("49");
    }
  };

  const handleProcessCheckout = async () => {
    soundManager.playTap();
    setIsTransmitting(true);

    const invoiceNum = `SETP-000${Math.floor(1000 + Math.random() * 9000)}`;
    const cufe = generateCufe(
      `${invoiceNum}-${documentNumber}-${total}-${Date.now()}-DIAN-COLOMBIA-2026`
    );

    // Simulación de los 3 pasos de validación DIAN
    setTransmissionStep("1/3 · Generando archivo XML bajo estándar UBL 2.1...");
    await new Promise((r) => setTimeout(r, 600));

    setTransmissionStep("2/3 · Firmando con certificado digital X.509 y calculando CUFE...");
    await new Promise((r) => setTimeout(r, 600));

    setTransmissionStep("3/3 · Conectando con el Web Service DIAN y obteniendo acuse ApplicationResponse...");
    await new Promise((r) => setTimeout(r, 700));

    const finalCustomer: DianCustomer = {
      documentType,
      documentNumber,
      dv,
      businessName: businessName.trim() || "Consumidor Final",
      email: customerEmail.trim() || "cliente@sazonbarrio.com",
      phone: customerPhone.trim() || "3000000000",
      taxRegime,
      city,
    };

    const invoice: DianInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invoiceNum,
      prefix: "SETP",
      cufe,
      qrCodeUrl: `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufe}`,
      tableId: table.id,
      tableName: table.name,
      waiterName: table.waiterName || currentUser.name,
      customer: finalCustomer,
      items: items.map((it) => ({
        name: it.menuItem.name,
        quantity: it.quantity,
        unitPrice: it.customPrice ?? it.menuItem.price,
        total: (it.customPrice ?? it.menuItem.price) * it.quantity,
      })),
      subtotal,
      taxAmount,
      tipAmount,
      total,
      paymentMethod,
      amountReceived: paymentMethod === "efectivo" ? effectiveReceived : total,
      changeAmount: paymentMethod === "efectivo" ? changeAmount : 0,
      authorizationNumber: `AUT-DIAN-${Math.floor(100000 + Math.random() * 900000)}`,
      dianStatus: "Aprobada",
      issuedAt: new Date().toISOString(),
    };

    setIsTransmitting(false);
    setGeneratedInvoice(invoice);
    soundManager.playSuccess();
    onInvoiceCreated(invoice);
  };

  const handleCopyCufe = () => {
    if (!generatedInvoice) return;
    navigator.clipboard.writeText(generatedInvoice.cufe);
    setCopiedCufe(true);
    setTimeout(() => setCopiedCufe(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0F1626] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-[#141E33] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xl">
              🏛️
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Cobro & Facturación Electrónica DIAN
              </h2>
              <p className="text-xs text-slate-400">
                {table.name} · Mesera: {table.waiterName || currentUser.name}
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

        {/* SI YA SE EMITIÓ LA FACTURA: PANTALLA DE ÉXITO DIAN */}
        {generatedInvoice ? (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Banner de Validación Exitosa */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center shrink-0">
                  ✓
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base">
                      Factura Transmitida y Aprobada
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                      DIAN 100% OK
                    </span>
                  </div>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    No. Oficial: <strong className="text-white">{generatedInvoice.invoiceNumber}</strong> · Autorización: {generatedInvoice.authorizationNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Total Pagado:</span>
                <span className="text-xl font-black text-emerald-400">
                  {formatCOP(generatedInvoice.total)}
                </span>
              </div>
            </div>

            {/* CUFE y Código QR Oficial DIAN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#141D30] border border-slate-800 p-4 rounded-2xl">
              {/* QR Code Simulado SVG */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl text-slate-950">
                <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
                  {/* Patrón estilizado de QR DIAN */}
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="25" height="25" fill="#000" />
                  <rect x="15" y="15" width="15" height="15" fill="#fff" />
                  <rect x="19" y="19" width="7" height="7" fill="#000" />

                  <rect x="65" y="10" width="25" height="25" fill="#000" />
                  <rect x="70" y="15" width="15" height="15" fill="#fff" />
                  <rect x="74" y="19" width="7" height="7" fill="#000" />

                  <rect x="10" y="65" width="25" height="25" fill="#000" />
                  <rect x="15" y="70" width="15" height="15" fill="#fff" />
                  <rect x="19" y="74" width="7" height="7" fill="#000" />

                  <rect x="42" y="15" width="16" height="6" fill="#000" />
                  <rect x="42" y="28" width="6" height="18" fill="#000" />
                  <rect x="52" y="32" width="12" height="6" fill="#000" />
                  <rect x="42" y="55" width="20" height="6" fill="#000" />
                  <rect x="70" y="55" width="15" height="15" fill="#000" />
                  <rect x="45" y="75" width="30" height="8" fill="#000" />
                  <rect x="80" y="75" width="10" height="15" fill="#000" />
                </svg>
                <span className="text-[9px] font-black tracking-wider uppercase mt-1 text-slate-700">
                  QR DIAN VPFE
                </span>
              </div>

              {/* Datos CUFE y Adquirente */}
              <div className="sm:col-span-2 space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      CUFE (Código Único Factura Electrónica):
                    </span>
                    <button
                      onClick={handleCopyCufe}
                      className="text-[10px] text-teal-400 hover:text-teal-300 font-bold"
                    >
                      {copiedCufe ? "✓ ¡Copiado!" : "📋 Copiar CUFE"}
                    </button>
                  </div>
                  <div className="mt-1 p-2 rounded-xl bg-[#090D16] border border-slate-800 text-[10px] font-mono text-teal-300 break-all select-all leading-relaxed">
                    {generatedInvoice.cufe}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Adquirente:</span>
                    <span className="font-semibold">{generatedInvoice.customer.businessName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Documento:</span>
                    <span className="font-mono">
                      {generatedInvoice.customer.documentType} {generatedInvoice.customer.documentNumber}
                      {generatedInvoice.customer.dv ? `-${generatedInvoice.customer.dv}` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Medio de Pago:</span>
                    <span className="capitalize font-semibold text-amber-400">
                      {generatedInvoice.paymentMethod}
                    </span>
                  </div>
                  {generatedInvoice.changeAmount && generatedInvoice.changeAmount > 0 ? (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Devuelta entregada:</span>
                      <span>{formatCOP(generatedInvoice.changeAmount)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Botones de Acción Post-Factura */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* WhatsApp */}
              <a
                href={buildWhatsAppInvoiceUrl(generatedInvoice.customer.phone, {
                  invoiceNumber: generatedInvoice.invoiceNumber,
                  customerName: generatedInvoice.customer.businessName,
                  total: generatedInvoice.total,
                  cufe: generatedInvoice.cufe,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition text-center"
              >
                <span>💬</span>
                <span>Enviar por WhatsApp</span>
              </a>

              {/* Imprimir Tiquete Térmico */}
              <button
                type="button"
                onClick={handlePrint}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <span>🖨️</span>
                <span>Imprimir Tirilla 80mm</span>
              </button>

              {/* Finalizar */}
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-2xl bg-[#00A6A6] hover:bg-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition"
              >
                <span>✓ Finalizar Mesa</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE COBRO Y DATOS DIAN */
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Banner de Monto Total */}
            <div className="bg-[#141E33] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Total a Pagar (Inc. Impoconsumo 8% + Propina):</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                  {formatCOP(total)}
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div>Subtotal: {formatCOP(subtotal)}</div>
                <div>Propina ({tipPercentage}%): {formatCOP(tipAmount)}</div>
              </div>
            </div>

            {/* SELECCIÓN DE MEDIO DE PAGO */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-2">
                1. Selecciona Medio de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "efectivo" as const, label: "Efectivo", icon: "💵" },
                  { id: "tarjeta" as const, label: "Tarjeta / Datáfono", icon: "💳" },
                  { id: "nequi" as const, label: "Transferencia (Nequi/Daviplata)", icon: "📱" },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        soundManager.playTap();
                        setPaymentMethod(pm.id);
                      }}
                      className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-[#00A6A6] text-white border-teal-300 shadow-md shadow-teal-500/20"
                          : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-xl">{pm.icon}</span>
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Campos condicionales por Medio de Pago */}
              {paymentMethod === "efectivo" && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#141D30] border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Billetes rápidos o monto recibido:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[20000, 50000, 100000, 200000].map((bill) => (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => {
                            soundManager.playTap();
                            setAmountReceived(bill);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-amber-300"
                        >
                          {formatCOP(bill)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playTap();
                          setAmountReceived(total);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-teal-900/60 hover:bg-teal-900 border border-teal-500/40 text-xs font-bold text-teal-300"
                      >
                        Exacto
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Monto recibido:</label>
                      <input
                        type="number"
                        value={amountReceived || ""}
                        onChange={(e) => setAmountReceived(Number(e.target.value))}
                        placeholder={String(total)}
                        className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Devuelta / Cambio:</label>
                      <div
                        className={`text-base font-black px-3 py-2 rounded-xl border ${
                          amountReceived >= total || amountReceived === 0
                            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                            : "bg-red-950/40 border-red-500/40 text-red-400"
                        }`}
                      >
                        {amountReceived >= total || amountReceived === 0
                          ? formatCOP(changeAmount)
                          : `Faltan ${formatCOP(missingAmount)}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "tarjeta" && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#141D30] border border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">No. Comprobante / Voucher:</label>
                    <input
                      type="text"
                      value={voucherNumber}
                      onChange={(e) => setVoucherNumber(e.target.value)}
                      placeholder="Ej: 009482"
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Franquicia Datáfono:</label>
                    <select className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400">
                      <option>Visa Débito/Crédito</option>
                      <option>Mastercard</option>
                      <option>American Express</option>
                      <option>Tarjeta Diners</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === "nequi" && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#141D30] border border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Plataforma:</label>
                    <select
                      value={transferPlatform}
                      onChange={(e) => setTransferPlatform(e.target.value as any)}
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="nequi">Nequi (Celular)</option>
                      <option value="daviplata">Daviplata</option>
                      <option value="bancolombia">Bancolombia a la Mano</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Referencia / Aprobación M-:</label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="Ej: M-8839201"
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SELECCIÓN TIPO DE COMPROBANTE: FACTURA ELECTRÓNICA DIAN */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <span>2. Modalidad de Facturación</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDianInvoice(false)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      !isDianInvoice
                        ? "bg-slate-700 text-white border-slate-600"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    Ticket POS Rápido
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDianInvoice(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      isDianInvoice
                        ? "bg-teal-600 text-white border-teal-400 shadow-md shadow-teal-500/20"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    Factura Electrónica DIAN
                  </button>
                </div>
              </div>

              {/* Plantillas Rápidas para Agilizar Toma de Datos */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[11px] text-slate-400">Atajos rápidos:</span>
                <button
                  type="button"
                  onClick={() => handleSelectConsumerType("persona")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                >
                  👤 Persona Natural (CC)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectConsumerType("empresa")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                >
                  🏢 Empresa (NIT)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectConsumerType("final")}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium"
                >
                  ⚡ Consumidor Final (222...)
                </button>
              </div>

              {/* Formulario Completo de Adquirente DIAN */}
              <div className="p-4 rounded-2xl bg-[#141D30] border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tipo de Documento:</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="NIT">NIT (Empresas / Jurídicas)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="PAS">Pasaporte (Extranjeros)</option>
                      <option value="CF">Consumidor Final (222222222222)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-400">Número de Identificación:</label>
                      {dv !== undefined && (
                        <span className="text-[10px] font-bold text-teal-400">DV: {dv}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        placeholder="Sin puntos ni guiones"
                        className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-400"
                      />
                      {dv !== undefined && (
                        <span className="px-2 py-1.5 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-300 font-mono text-xs font-bold">
                          -{dv}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Régimen Fiscal:</label>
                    <select
                      value={taxRegime}
                      onChange={(e) => setTaxRegime(e.target.value as any)}
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    >
                      <option value="49">49 - No Responsable de IVA</option>
                      <option value="48">48 - Responsable de IVA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Razón Social o Nombre Completo:
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Nombre del cliente o razón social"
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Correo para envío de XML y PDF:
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="cliente@correo.com"
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Teléfono / WhatsApp (para envío directo):
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="3101234567"
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Ciudad / Municipio:</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bogotá D.C."
                      className="w-full bg-[#0A0E17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Spinner de Transmisión DIAN si está en progreso */}
            {isTransmitting && (
              <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-center space-y-2">
                <div className="w-8 h-8 mx-auto border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-teal-300">{transmissionStep}</p>
                <p className="text-[11px] text-slate-400">
                  Por favor espere mientras el Web Service DIAN valida la firma digital...
                </p>
              </div>
            )}

            {/* Acciones de Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isTransmitting}
                className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={isTransmitting}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-teal-600/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <span>🚀 Transmitir a la DIAN y Cobrar ({formatCOP(total)})</span>
              </button>
            </div>
          </div>
        )}

        {/* Tiquete térmico oculto en pantalla pero visible al imprimir (@media print) */}
        {generatedInvoice && (
          <div id="thermal-receipt-printable" className="hidden font-mono text-[11px] text-black bg-white p-4">
            <div className="text-center mb-3">
              <h2 className="font-bold text-sm">SAZÓN DE BARRIO RESTAURANTE</h2>
              <p>NIT: 901.458.732-1 · Régimen Común</p>
              <p>Calle 72 # 11-45 · Bogotá D.C.</p>
              <p>Tel: (601) 745-9201 · Móvil: 315-889-4021</p>
              <p className="mt-1 font-bold">FACTURA ELECTRÓNICA DE VENTA</p>
              <p className="font-bold">{generatedInvoice.invoiceNumber}</p>
              <p>Res. DIAN 187640291 de 2026</p>
              <p>Prefijo SETP desde 1 hasta 50000</p>
            </div>
            <div className="border-t border-b border-black py-1 my-2">
              <p>Fecha: {new Date(generatedInvoice.issuedAt).toLocaleString("es-CO")}</p>
              <p>Mesa: {generatedInvoice.tableName} · Mesera: {generatedInvoice.waiterName}</p>
              <p>Cliente: {generatedInvoice.customer.businessName}</p>
              <p>Doc: {generatedInvoice.customer.documentType} {generatedInvoice.customer.documentNumber}</p>
            </div>
            <div className="space-y-1 mb-2">
              {generatedInvoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.name.slice(0, 18)}</span>
                  <span>{formatCOP(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-black pt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCOP(generatedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impoconsumo (8%):</span>
                <span>{formatCOP(generatedInvoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Propina Voluntaria:</span>
                <span>{formatCOP(generatedInvoice.tipAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                <span>TOTAL PAGADO:</span>
                <span>{formatCOP(generatedInvoice.total)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Medio de Pago:</span>
                <span className="uppercase">{generatedInvoice.paymentMethod}</span>
              </div>
            </div>
            <div className="mt-3 text-center text-[9px] border-t border-black pt-2">
              <p className="font-bold">CUFE DIAN:</p>
              <p className="break-all">{generatedInvoice.cufe}</p>
              <p className="mt-2 font-bold">¡GRACIAS POR TU VISITA!</p>
              <p>Representación gráfica de la factura electrónica</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
