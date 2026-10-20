"use client";

import React, { useState } from "react";
import { MenuItem, CartItem, RestaurantTable, UserProfile } from "@/lib/types";
import { MENU_ITEMS } from "@/lib/store";
import { formatCOP } from "@/lib/dian";
import { soundManager } from "@/lib/audio";

interface PosModuleProps {
  tables: RestaurantTable[];
  selectedTable?: RestaurantTable;
  currentUser: UserProfile;
  onSaveOrderToTable: (tableId: number, items: CartItem[], tipPercentage: number) => void;
  onProceedToCheckout: (tableId: number, items: CartItem[], tipPercentage: number) => void;
}

export const PosModule: React.FC<PosModuleProps> = ({
  tables,
  selectedTable,
  currentUser,
  onSaveOrderToTable,
  onProceedToCheckout,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<number>(selectedTable?.id || 1);
  const [activeCategory, setActiveCategory] = useState<MenuItem["category"] | "todas">("todas");
  const [searchQuery, setSearchQuery] = useState("");

  // Inicializar carrito con la orden existente de la mesa si la tiene
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (selectedTable?.currentOrder?.items) {
      return [...selectedTable.currentOrder.items];
    }
    return [];
  });

  const [tipPercentage, setTipPercentage] = useState<number>(() => {
    return selectedTable?.currentOrder?.tipPercentage ?? 10;
  });

  const [splitCount, setSplitCount] = useState<number>(1);
  const [itemNoteModal, setItemNoteModal] = useState<{ index: number; text: string } | null>(null);

  // Filtrado de productos
  const filteredProducts = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "todas" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Acciones de carrito
  const addToCart = (product: MenuItem) => {
    soundManager.playTap();
    setCart((prev) => {
      const idx = prev.findIndex((ci) => ci.menuItem.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          menuItem: product,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    soundManager.playTap();
    setCart((prev) => {
      const next = [...prev];
      const target = next[index];
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
        return next;
      }
      next[index] = { ...target, quantity: newQty };
      return next;
    });
  };

  const removeItem = (index: number) => {
    soundManager.playTap();
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveNote = () => {
    if (!itemNoteModal) return;
    setCart((prev) => {
      const next = [...prev];
      if (next[itemNoteModal.index]) {
        next[itemNoteModal.index] = {
          ...next[itemNoteModal.index],
          notes: itemNoteModal.text.trim() || undefined,
        };
      }
      return next;
    });
    setItemNoteModal(null);
  };

  // Cálculos financieros
  const subtotal = cart.reduce((acc, item) => {
    const price = item.customPrice ?? item.menuItem.price;
    return acc + price * item.quantity;
  }, 0);

  const impoconsumo = Math.round(subtotal * 0.08); // 8% en restaurantes en Colombia
  const tipAmount = Math.round(subtotal * (tipPercentage / 100));
  const total = subtotal + impoconsumo + tipAmount;
  const splitAmount = splitCount > 1 ? Math.round(total / splitCount) : total;

  const currentTable = tables.find((t) => t.id === selectedTableId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* COLUMNA IZQUIERDA: Catálogo de productos (8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Mesa selector & Buscador */}
        <div className="bg-[#121B2D] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Mesa / Barra:
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setSelectedTableId(newId);
                const tbl = tables.find((t) => t.id === newId);
                if (tbl?.currentOrder?.items) {
                  setCart([...tbl.currentOrder.items]);
                  setTipPercentage(tbl.currentOrder.tipPercentage ?? 10);
                } else {
                  setCart([]);
                }
              }}
              className="bg-[#192338] border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-teal-400"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.status.toUpperCase()} · {t.waiterName || "Sin mesera"})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar plato o bebida..."
              className="w-full bg-[#192338] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categorías Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: "todas" as const, label: "Todo el Menú", icon: "🍴" },
            { id: "platos" as const, label: "Platos Fuertes", icon: "🍲" },
            { id: "bebidas" as const, label: "Bebidas", icon: "🥤" },
            { id: "adicionales" as const, label: "Entradas & Adicionales", icon: "🍟" },
            { id: "postres" as const, label: "Postres", icon: "🍨" },
          ].map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playTap();
                  setActiveCategory(cat.id);
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#00A6A6] text-white shadow-md shadow-teal-500/30 scale-102"
                    : "bg-[#121B2D] border border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const inCartItem = cart.find((c) => c.menuItem.id === product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => addToCart(product)}
                className="relative bg-[#121B2D] border border-slate-800 hover:border-teal-500/60 rounded-2xl p-3.5 text-left flex flex-col justify-between transition-all duration-150 group hover:shadow-lg hover:shadow-teal-500/5 active:scale-98"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="font-extrabold text-sm text-white group-hover:text-teal-300 transition-colors">
                      {product.name}
                    </h3>
                    {product.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-base font-black text-emerald-400">
                    {formatCOP(product.price)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {inCartItem && (
                      <span className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center">
                        {inCartItem.quantity}
                      </span>
                    )}
                    <span className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-[#00A6A6] text-slate-300 group-hover:text-white flex items-center justify-center font-bold text-sm transition">
                      +
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* COLUMNA DERECHA: Comanda / Carrito y Checkout (4-5 cols) */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="sticky top-20 bg-[#121B2D] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[calc(100vh-6rem)]">
          {/* Header Comanda */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🛒</span>
                <h3 className="font-black text-base text-white">Comanda en Curso</h3>
              </div>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">
                {currentTable?.name || `Mesa ${selectedTableId}`} · {cart.length} productos
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  soundManager.playTap();
                  setCart([]);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-950/40"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Lista de Items con Scroll */}
          <div className="my-3 overflow-y-auto space-y-2.5 flex-1 pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <div className="text-3xl mb-2">🍽️</div>
                <p className="text-xs font-semibold">Comanda vacía</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Toca cualquier plato o bebida para agregarlo
                </p>
              </div>
            ) : (
              cart.map((item, index) => {
                const itemTotal = (item.customPrice ?? item.menuItem.price) * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-[#162137] border border-slate-700/80 flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white leading-tight">
                          {item.menuItem.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatCOP(item.customPrice ?? item.menuItem.price)} c/u
                        </div>
                        {item.notes && (
                          <div className="text-[10px] text-amber-300 mt-0.5 font-medium flex items-center gap-1">
                            <span>📝</span>
                            <span>{item.notes}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        {formatCOP(itemTotal)}
                      </span>
                    </div>

                    {/* Controles de Cantidad y Notas */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                      <button
                        onClick={() =>
                          setItemNoteModal({ index, text: item.notes || "" })
                        }
                        className="text-[10px] font-semibold text-teal-300 hover:underline flex items-center gap-1"
                      >
                        <span>✏️</span>
                        <span>{item.notes ? "Editar nota" : "+ Nota cocina"}</span>
                      </button>

                      <div className="flex items-center gap-1.5 bg-[#0F1626] rounded-xl px-1.5 py-0.5 border border-slate-700">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-black px-1.5 text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(index)}
                          className="w-5 h-5 rounded text-rose-400 hover:text-rose-300 ml-1 flex items-center justify-center text-xs"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Opciones de Propina y Split Bill */}
          {cart.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              {/* Propina Voluntaria */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-400">Propina voluntaria:</span>
                  <span className="font-bold text-amber-400">{formatCOP(tipAmount)}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        soundManager.playTap();
                        setTipPercentage(pct);
                      }}
                      className={`py-1 rounded-xl text-xs font-bold border transition ${
                        tipPercentage === pct
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* División de cuentas (Split Bill) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-400">Dividir cuenta:</span>
                  <span className="font-bold text-teal-300">
                    {splitCount === 1 ? "1 cuenta única" : `${splitCount} personas`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        soundManager.playTap();
                        setSplitCount(count);
                      }}
                      className={`py-1 rounded-xl text-xs font-bold border transition ${
                        splitCount === count
                          ? "bg-teal-500 text-slate-950 border-teal-400 shadow-sm"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {count === 1 ? "Única" : `${count} pax`}
                    </button>
                  ))}
                </div>
                {splitCount > 1 && (
                  <div className="mt-1.5 p-2 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 flex items-center justify-between">
                    <span>Monto por comensal:</span>
                    <span className="font-black text-teal-300">{formatCOP(splitAmount)}</span>
                  </div>
                )}
              </div>

              {/* Desglose de Totales */}
              <div className="bg-[#0E1524] p-3 rounded-2xl border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal neto:</span>
                  <span>{formatCOP(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Impoconsumo (8%):</span>
                  <span>{formatCOP(impoconsumo)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Propina voluntaria ({tipPercentage}%):</span>
                  <span>{formatCOP(tipAmount)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-700 font-extrabold text-sm sm:text-base text-white">
                  <span>Total general:</span>
                  <span className="text-emerald-400 text-lg">{formatCOP(total)}</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    onSaveOrderToTable(selectedTableId, cart, tipPercentage);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                >
                  💾 Guardar en Mesa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    onProceedToCheckout(selectedTableId, cart, tipPercentage);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/30 transition active:scale-95"
                >
                  💳 Cobrar / DIAN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Notas de Cocina */}
      {itemNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#111827] border border-slate-700 rounded-2xl p-5 shadow-2xl">
            <h4 className="text-sm font-bold text-white mb-2">Nota de cocina / Modificador</h4>
            <p className="text-xs text-slate-400 mb-3">
              Modifica términos de cocción, adiciones o advertencias de alergias
            </p>
            <input
              type="text"
              autoFocus
              value={itemNoteModal.text}
              onChange={(e) => setItemNoteModal({ ...itemNoteModal, text: e.target.value })}
              placeholder="Ej: Término 3/4, salsa aparte, sin cebolla..."
              className="w-full bg-[#182338] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 mb-3"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setItemNoteModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-500"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
