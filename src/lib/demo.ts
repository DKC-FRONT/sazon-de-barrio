// Modo demo: sin Supabase y con datos de prueba.
// Cuando conectes Supabase, cambia la línea siguiente por:
// export const DEMO = process.env.NEXT_PUBLIC_DEMO === "true";
export const DEMO = true;

export type Role = "admin" | "caja" | "mesera";
export type Status = "libre" | "consumo" | "cuenta" | "pagada";
export type Table = { id: number; name: string; status: Status; waiter: { name: string } | null };

export const DEMO_PASSWORD = "demo123";

export const DEMO_USERS: { email: string; name: string; role: Role }[] = [
  { email: "admin@demo.com", name: "Administrador", role: "admin" },
  { email: "caja@demo.com", name: "Caja", role: "caja" },
  { email: "mesera@demo.com", name: "Camila", role: "mesera" },
];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  caja: "Caja",
  mesera: "Mesera",
};

export const DEMO_TABLES: Table[] = [
  { id: 1, name: "Mesa 1", status: "consumo", waiter: { name: "Camila" } },
  { id: 2, name: "Mesa 2", status: "cuenta", waiter: { name: "Laura" } },
  { id: 3, name: "Mesa 3", status: "libre", waiter: null },
  { id: 4, name: "Mesa 4", status: "pagada", waiter: { name: "Andrea" } },
  { id: 5, name: "Mesa 5", status: "consumo", waiter: { name: "Camila" } },
  { id: 6, name: "Mesa 6", status: "libre", waiter: null },
  { id: 7, name: "Mesa 7", status: "cuenta", waiter: { name: "Andrea" } },
  { id: 8, name: "Mesa 8", status: "libre", waiter: null },
  { id: 9, name: "Mesa 9", status: "consumo", waiter: { name: "Laura" } },
  { id: 10, name: "Mesa 10", status: "libre", waiter: null },
];
