import { MenuItem, RestaurantTable, ServiceRequest, DianInvoice, UserProfile, Role } from "./types";
import { formatCOP } from "./dian";

export const DEMO_USERS: UserProfile[] = [
  { id: "usr_mesera", name: "Camila Restrepo", email: "mesera@demo.com", role: "mesera", avatar: "👩‍🍳" },
  { id: "usr_caja", name: "Valentina Gómez", email: "caja@demo.com", role: "caja", avatar: "💻" },
  { id: "usr_admin", name: "Carlos Mendoza", email: "admin@demo.com", role: "admin", avatar: "👔" },
];

export const MENU_ITEMS: MenuItem[] = [
  // Platos
  {
    id: "p1",
    name: "Bandeja Paisa Especial",
    category: "platos",
    price: 38000,
    description: "Frijoles antioqueños, chicharrón carnudo, carne molida, chorizo, huevo frito, aguacate y arepa.",
    badge: "⭐ Más Vendido",
  },
  {
    id: "p2",
    name: "Ajiaco Santafereño",
    category: "platos",
    price: 32000,
    description: "Con pollo desmechado, mazorca tierna, tres tipos de papa, alcaparras, crema de leche y arroz.",
    badge: "Tradicional",
  },
  {
    id: "p3",
    name: "Cazuela de Mariscos",
    category: "platos",
    price: 46000,
    description: "Mariscos frescos en base de leche de coco, patacón crocante y arroz con coco.",
    badge: "Especial del Chef",
  },
  {
    id: "p4",
    name: "Costillitas Ahumadas BBQ",
    category: "platos",
    price: 36000,
    description: "Costillas de cerdo glaseadas en salsa bbq de panela y maracuyá, acompañadas de papas criollas.",
  },
  {
    id: "p5",
    name: "Lomo al Trapo",
    category: "platos",
    price: 44000,
    description: "Corte fino sellado en costra de sal y vino tinto, papas rústicas y ensalada fresca.",
  },
  {
    id: "p6",
    name: "Pollo Campesino Asado",
    category: "platos",
    price: 28000,
    description: "Medio pollo marinado en hierbas de huerta, yuca al vapor y arepa con queso.",
  },
  {
    id: "p7",
    name: "Sobrebarriga en Salsa Criolla",
    category: "platos",
    price: 34000,
    description: "Corte suave bañado en hogao casero con papa chorreada y arroz.",
  },

  // Bebidas
  {
    id: "b1",
    name: "Limonada de Coco Natural",
    category: "bebidas",
    price: 12000,
    description: "Cremosa y refrescante con coco tierno y toque de hierbabuena.",
    badge: "Favorita",
  },
  {
    id: "b2",
    name: "Jugo Natural en Agua/Leche",
    category: "bebidas",
    price: 9000,
    description: "Maracuyá, Guanábana, Mango o Lulo recién preparado.",
  },
  {
    id: "b3",
    name: "Cerveza Club Colombia Dorada",
    category: "bebidas",
    price: 8500,
    description: "Botella 330ml bien fría.",
  },
  {
    id: "b4",
    name: "Refajo Casero (Jarra 1.5L)",
    category: "bebidas",
    price: 22000,
    description: "Cerveza rubia con Colombiana y toque de aguardiente anisado.",
  },
  {
    id: "b5",
    name: "Gaseosa Postobón 400ml",
    category: "bebidas",
    price: 5000,
    description: "Manzana, Colombiana o Bretaña.",
  },
  {
    id: "b6",
    name: "Café Campesino con Panela",
    category: "bebidas",
    price: 4500,
    description: "Café de origen filtrado en olleta con astilla de canela.",
  },

  // Adicionales
  {
    id: "a1",
    name: "Canasta de Empanaditas (x5)",
    category: "adicionales",
    price: 15000,
    description: "Masa de maíz crujiente rellena de carne criolla con ají casero.",
  },
  {
    id: "a2",
    name: "Patacones con Hogao y Guacamole",
    category: "adicionales",
    price: 14000,
    description: "Cuatro patacones de plátano verde recién fritos.",
  },
  {
    id: "a3",
    name: "Chicharrón Carnudo Crocante",
    category: "adicionales",
    price: 24000,
    description: "Porción de 250g con arepa santandereana y limón mandarino.",
  },
  {
    id: "a4",
    name: "Porción Papa Criolla Frita",
    category: "adicionales",
    price: 9000,
    description: "Doradas con sal marina y romero.",
  },
  {
    id: "a5",
    name: "Porción de Arroz Blanco",
    category: "adicionales",
    price: 5000,
    description: "Graneado con toque de ajo campesino.",
  },

  // Postres
  {
    id: "po1",
    name: "Tres Leches Tradicional",
    category: "postres",
    price: 11000,
    description: "Bizcochuelo bañado en salsa de tres leches y canela.",
  },
  {
    id: "po2",
    name: "Brevas con Arequipe",
    category: "postres",
    price: 10000,
    description: "Brevas en almíbar de panela con arequipe de paila y queso.",
  },
  {
    id: "po3",
    name: "Flan Casero de Caramelo",
    category: "postres",
    price: 9500,
    description: "Textura sedosa con caramelo dorado artesanal.",
  },
];

export const INITIAL_TABLES: RestaurantTable[] = [
  {
    id: 1,
    name: "Mesa 1",
    capacity: 4,
    status: "consumo",
    waiterName: "Camila Restrepo",
    currentOrder: {
      id: "ord_1",
      tableId: 1,
      tableName: "Mesa 1",
      waiterName: "Camila Restrepo",
      items: [
        { id: "i1", menuItem: MENU_ITEMS[0], quantity: 2 }, // 2x Bandeja Paisa = 76000
        { id: "i2", menuItem: MENU_ITEMS[7], quantity: 2 }, // 2x Limonada Coco = 24000
      ],
      subtotal: 100000,
      impoconsumo: 8000,
      tipPercentage: 10,
      tipAmount: 10000,
      total: 118000,
      status: "abierta",
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
  },
  {
    id: 2,
    name: "Mesa 2",
    capacity: 2,
    status: "cuenta",
    waiterName: "Laura Martínez",
    currentOrder: {
      id: "ord_2",
      tableId: 2,
      tableName: "Mesa 2",
      waiterName: "Laura Martínez",
      items: [
        { id: "i3", menuItem: MENU_ITEMS[1], quantity: 2 }, // Ajiaco = 64000
        { id: "i4", menuItem: MENU_ITEMS[8], quantity: 2 }, // Jugos = 18000
      ],
      subtotal: 82000,
      impoconsumo: 6560,
      tipPercentage: 10,
      tipAmount: 8200,
      total: 96760,
      status: "por_cobrar",
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    lastRequest: {
      id: "req_2",
      tableId: 2,
      tableName: "Mesa 2",
      waiterName: "Laura Martínez",
      reason: "solicitar_cuenta",
      quickNote: "Paga con Nequi · Con propina 10%",
      createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      status: "pendiente",
    },
  },
  { id: 3, name: "Mesa 3", capacity: 4, status: "libre", waiterName: null },
  {
    id: 4,
    name: "Mesa 4",
    capacity: 6,
    status: "pagada",
    waiterName: "Andrea Gómez",
  },
  {
    id: 5,
    name: "Mesa 5",
    capacity: 4,
    status: "consumo",
    waiterName: "Camila Restrepo",
    currentOrder: {
      id: "ord_5",
      tableId: 5,
      tableName: "Mesa 5",
      waiterName: "Camila Restrepo",
      items: [
        { id: "i5", menuItem: MENU_ITEMS[3], quantity: 1 }, // Costillitas = 36000
        { id: "i6", menuItem: MENU_ITEMS[9], quantity: 2 }, // Cervezas = 17000
      ],
      subtotal: 53000,
      impoconsumo: 4240,
      tipPercentage: 10,
      tipAmount: 5300,
      total: 62540,
      status: "abierta",
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    },
  },
  { id: 6, name: "Mesa 6", capacity: 2, status: "libre", waiterName: null },
  {
    id: 7,
    name: "Mesa 7",
    capacity: 8,
    status: "cuenta",
    waiterName: "Andrea Gómez",
    currentOrder: {
      id: "ord_7",
      tableId: 7,
      tableName: "Mesa 7",
      waiterName: "Andrea Gómez",
      items: [
        { id: "i7", menuItem: MENU_ITEMS[2], quantity: 2 }, // Cazuelas = 92000
        { id: "i8", menuItem: MENU_ITEMS[4], quantity: 1 }, // Lomo = 44000
        { id: "i9", menuItem: MENU_ITEMS[7], quantity: 3 }, // Limonadas = 36000
      ],
      subtotal: 172000,
      impoconsumo: 13760,
      tipPercentage: 10,
      tipAmount: 17200,
      total: 202960,
      status: "por_cobrar",
      createdAt: new Date(Date.now() - 75 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    lastRequest: {
      id: "req_7",
      tableId: 7,
      tableName: "Mesa 7",
      waiterName: "Andrea Gómez",
      reason: "solicitar_cuenta",
      quickNote: "Dividir entre 2 · Tarjeta débito",
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      status: "pendiente",
    },
  },
  { id: 8, name: "Mesa 8", capacity: 4, status: "libre", waiterName: null },
  {
    id: 9,
    name: "Mesa 9",
    capacity: 2,
    status: "consumo",
    waiterName: "Laura Martínez",
    currentOrder: {
      id: "ord_9",
      tableId: 9,
      tableName: "Mesa 9",
      waiterName: "Laura Martínez",
      items: [
        { id: "i10", menuItem: MENU_ITEMS[5], quantity: 1 }, // Pollo campesino = 28000
        { id: "i11", menuItem: MENU_ITEMS[11], quantity: 1 }, // Gaseosa = 5000
      ],
      subtotal: 33000,
      impoconsumo: 2640,
      tipPercentage: 10,
      tipAmount: 3300,
      total: 38940,
      status: "abierta",
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  },
  { id: 10, name: "Mesa 10", capacity: 4, status: "libre", waiterName: null },
];

export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: "req_7",
    tableId: 7,
    tableName: "Mesa 7",
    waiterName: "Andrea Gómez",
    reason: "solicitar_cuenta",
    quickNote: "Dividir entre 2 · Tarjeta débito",
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    status: "pendiente",
  },
  {
    id: "req_2",
    tableId: 2,
    tableName: "Mesa 2",
    waiterName: "Laura Martínez",
    reason: "solicitar_cuenta",
    quickNote: "Paga con Nequi · Con propina 10%",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    status: "pendiente",
  },
];

export const INITIAL_INVOICES: DianInvoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "SETP-000489",
    prefix: "SETP",
    cufe: "a9f8e7d6c5b4a39281726354890123456789abcdef0123456789abcdef012345",
    qrCodeUrl: "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=a9f8e7d6c5b4a39281726354890123456789abcdef0123456789abcdef012345",
    tableId: 4,
    tableName: "Mesa 4",
    waiterName: "Andrea Gómez",
    customer: {
      documentType: "CC",
      documentNumber: "1020304050",
      businessName: "Mauricio Morales",
      email: "mauricio.m@correo.com",
      phone: "3154567890",
      taxRegime: "49",
      city: "Bogotá D.C.",
    },
    items: [
      { name: "Bandeja Paisa Especial", quantity: 2, unitPrice: 38000, total: 76000 },
      { name: "Limonada de Coco Natural", quantity: 2, unitPrice: 12000, total: 24000 },
    ],
    subtotal: 100000,
    taxAmount: 8000,
    tipAmount: 10000,
    total: 118000,
    paymentMethod: "tarjeta",
    authorizationNumber: "AUT-772910",
    dianStatus: "Aprobada",
    issuedAt: new Date(Date.now() - 110 * 60000).toISOString(),
  },
  {
    id: "inv_2",
    invoiceNumber: "SETP-000490",
    prefix: "SETP",
    cufe: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    qrCodeUrl: "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    tableId: 8,
    tableName: "Mesa 8",
    waiterName: "Camila Restrepo",
    customer: {
      documentType: "NIT",
      documentNumber: "900854321",
      dv: "7",
      businessName: "Inversiones del Café S.A.S.",
      email: "contabilidad@inversionescafe.co",
      phone: "3109876543",
      taxRegime: "48",
      city: "Medellín",
    },
    items: [
      { name: "Cazuela de Mariscos", quantity: 2, unitPrice: 46000, total: 92000 },
      { name: "Refajo Casero (Jarra 1.5L)", quantity: 1, unitPrice: 22000, total: 22000 },
    ],
    subtotal: 114000,
    taxAmount: 9120,
    tipAmount: 11400,
    total: 134520,
    paymentMethod: "transferencia" as any,
    authorizationNumber: "AUT-884210",
    dianStatus: "Aprobada",
    issuedAt: new Date(Date.now() - 85 * 60000).toISOString(),
  },
  {
    id: "inv_3",
    invoiceNumber: "SETP-000491",
    prefix: "SETP",
    cufe: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
    qrCodeUrl: "https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
    tableId: 3,
    tableName: "Mesa 3",
    waiterName: "Laura Martínez",
    customer: {
      documentType: "CF",
      documentNumber: "222222222222",
      businessName: "Consumidor Final",
      email: "ventas@sazonbarrio.com",
      phone: "3000000000",
      taxRegime: "49",
      city: "Bogotá D.C.",
    },
    items: [
      { name: "Ajiaco Santafereño", quantity: 1, unitPrice: 32000, total: 32000 },
      { name: "Tres Leches Tradicional", quantity: 1, unitPrice: 11000, total: 11000 },
    ],
    subtotal: 43000,
    taxAmount: 3440,
    tipAmount: 4300,
    total: 50740,
    paymentMethod: "efectivo",
    amountReceived: 60000,
    changeAmount: 9260,
    authorizationNumber: "AUT-110294",
    dianStatus: "Aprobada",
    issuedAt: new Date(Date.now() - 40 * 60000).toISOString(),
  },
];

// Helper de LocalStorage y BroadcastChannel
const STORAGE_KEYS = {
  TABLES: "sazon_tables_v1",
  REQUESTS: "sazon_requests_v1",
  INVOICES: "sazon_invoices_v1",
  USER: "sazon_active_user_v1",
};

export const restaurantStore = {
  getTables(): RestaurantTable[] {
    if (typeof window === "undefined") return INITIAL_TABLES;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    this.saveTables(INITIAL_TABLES);
    return INITIAL_TABLES;
  },

  saveTables(tables: RestaurantTable[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch {
      // ignore
    }
  },

  getRequests(): ServiceRequest[] {
    if (typeof window === "undefined") return INITIAL_REQUESTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    this.saveRequests(INITIAL_REQUESTS);
    return INITIAL_REQUESTS;
  },

  saveRequests(requests: ServiceRequest[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch {
      // ignore
    }
  },

  getInvoices(): DianInvoice[] {
    if (typeof window === "undefined") return INITIAL_INVOICES;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    this.saveInvoices(INITIAL_INVOICES);
    return INITIAL_INVOICES;
  },

  saveInvoices(invoices: DianInvoice[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch {
      // ignore
    }
  },

  getActiveUser(): UserProfile {
    if (typeof window === "undefined") return DEMO_USERS[0];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEMO_USERS[0];
  },

  setActiveUser(user: UserProfile): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Sincronizar cookie de sesión demo
    document.cookie = `sazon_demo_user=${encodeURIComponent(user.email)}; path=/; max-age=28800; samesite=lax`;
  },

  resetAllData(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  },
};

// Generador de archivo CSV Excel con BOM UTF-8 y formato compatible
export function exportSalesToCsv(invoices: DianInvoice[]): void {
  const headers = [
    "No. Factura",
    "Fecha y Hora",
    "Mesa",
    "Mesera",
    "Tipo Doc",
    "No. Documento",
    "Cliente / Razon Social",
    "Email",
    "Medio de Pago",
    "Subtotal (COP)",
    "Impoconsumo 8% (COP)",
    "Propina (COP)",
    "Total Pagado (COP)",
    "Estado DIAN",
    "CUFE DIAN",
  ];

  const rows = invoices.map((inv) => [
    `"${inv.invoiceNumber}"`,
    `"${new Date(inv.issuedAt).toLocaleString("es-CO")}"`,
    `"${inv.tableName}"`,
    `"${inv.waiterName}"`,
    `"${inv.customer.documentType}"`,
    `"${inv.customer.documentNumber}${inv.customer.dv ? "-" + inv.customer.dv : ""}"`,
    `"${inv.customer.businessName.replace(/"/g, '""')}"`,
    `"${inv.customer.email}"`,
    `"${inv.paymentMethod.toUpperCase()}"`,
    inv.subtotal,
    inv.taxAmount,
    inv.tipAmount,
    inv.total,
    `"${inv.dianStatus}"`,
    `"${inv.cufe}"`,
  ]);

  const csvContent =
    "\uFEFF" + // BOM UTF-8 para Excel
    [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const nowStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `Cierre_Caja_SazonBarrio_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
