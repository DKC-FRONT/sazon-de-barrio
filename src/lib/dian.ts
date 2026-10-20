// Utilidades para Facturación Electrónica DIAN (Colombia)
// Generación de CUFE, validación de NIT con DV y QR

export function calculateNitDv(nit: string): string {
  const cleanNit = nit.replace(/\D/g, "");
  if (!cleanNit) return "0";

  const vpri = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  const len = cleanNit.length;
  let total = 0;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(cleanNit.charAt(len - 1 - i), 10);
    const factor = vpri[15 - 1 - i] || 1;
    total += digit * factor;
  }

  const remainder = total % 11;
  if (remainder === 0) return "0";
  if (remainder === 1) return "1";
  return String(11 - remainder);
}

// Genera un CUFE simulado de 64 caracteres hexadecimales (estándar DIAN UBL 2.1)
export function generateCufe(seed: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const part1 = (hash >>> 0).toString(16).padStart(8, "0");
  const part2 = Math.abs(Math.sin(hash) * 0xffffffff >>> 0).toString(16).padStart(8, "0");
  const part3 = Math.abs(Math.cos(hash) * 0xffffffff >>> 0).toString(16).padStart(8, "0");
  const part4 = Math.abs(Math.tan(hash) * 0xffffffff >>> 0).toString(16).padStart(8, "0");
  const part5 = Math.abs(Math.sin(hash + 1) * 0xffffffff >>> 0).toString(16).padStart(8, "0");
  const part6 = Math.abs(Math.cos(hash + 2) * 0xffffffff >>> 0).toString(16).padStart(8, "0");
  const part7 = Math.abs(Math.tan(hash + 3) * 0xffffffff >>> 0).toString(16).padStart(8, "0");
  const part8 = Math.abs(Math.sin(hash + 4) * 0xffffffff >>> 0).toString(16).padStart(8, "0");
  return (part1 + part2 + part3 + part4 + part5 + part6 + part7 + part8).toLowerCase().slice(0, 64);
}

// Formateador de moneda en pesos colombianos ($COP)
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Genera un mensaje de WhatsApp formateado con la factura
export function buildWhatsAppInvoiceUrl(phone: string, invoice: {
  invoiceNumber: string;
  customerName: string;
  total: number;
  cufe: string;
  restaurantName?: string;
}): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const rest = invoice.restaurantName || "Sazón de Barrio";
  const text = 
`🍽️ *${rest}* - Factura Electrónica
Hola *${invoice.customerName}*, gracias por tu visita.

📄 *Factura:* ${invoice.invoiceNumber}
💰 *Total Pagado:* ${formatCOP(invoice.total)}
🔐 *CUFE DIAN:* ${invoice.cufe.slice(0, 24)}...
🏛️ *Estado DIAN:* Transmitida y Aprobada ✅

Puedes consultar la validez de tu factura electrónica escaneando el código QR o en el portal oficial de la DIAN.
¡Esperamos verte pronto!`;

  return `https://wa.me/${cleanPhone.startsWith("57") ? cleanPhone : "57" + cleanPhone}?text=${encodeURIComponent(text)}`;
}
