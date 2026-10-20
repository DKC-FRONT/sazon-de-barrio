export type Role = "admin" | "caja" | "mesera";

export type TableStatus = "libre" | "consumo" | "cuenta" | "pagada";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: "platos" | "bebidas" | "adicionales" | "postres";
  price: number;
  description: string;
  badge?: string;
  image?: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  customPrice?: number;
}

export interface TableOrder {
  id: string;
  tableId: number;
  tableName: string;
  waiterName: string;
  items: CartItem[];
  subtotal: number;
  impoconsumo: number; // 8% en Colombia
  tipPercentage: number; // 0, 5, 10 o custom
  tipAmount: number;
  total: number;
  status: "abierta" | "por_cobrar" | "pagada";
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = "efectivo" | "tarjeta" | "nequi" | "daviplata" | "mixto";

export type DocumentType = "CC" | "NIT" | "CE" | "PAS" | "TI" | "CF";

export interface DianCustomer {
  documentType: DocumentType;
  documentNumber: string;
  dv?: string; // Dígito de verificación para NIT
  businessName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  taxRegime: "48" | "49"; // 48: Responsable IVA, 49: No Responsable
}

export interface DianInvoice {
  id: string;
  invoiceNumber: string; // ej. SETP-98201
  prefix: string;
  cufe: string; // Hash hex 64 chars
  qrCodeUrl: string;
  tableId: number;
  tableName: string;
  waiterName: string;
  customer: DianCustomer;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number; // Impoconsumo 8% o IVA
  tipAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  changeAmount?: number;
  authorizationNumber: string;
  dianStatus: "Aprobada" | "Enviada" | "Rechazada";
  issuedAt: string;
}

export interface ServiceRequest {
  id: string;
  tableId: number;
  tableName: string;
  waiterName: string;
  reason: "solicitar_cuenta" | "corregir_cuenta" | "cambio_plato" | "ayuda";
  quickNote: string;
  createdAt: string;
  status: "pendiente" | "atendida";
}

export interface RestaurantTable {
  id: number;
  name: string;
  capacity: number;
  status: TableStatus;
  waiterName: string | null;
  currentOrder?: TableOrder;
  lastRequest?: ServiceRequest;
}
