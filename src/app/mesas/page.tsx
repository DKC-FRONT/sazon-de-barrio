import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import {
  DEMO,
  DEMO_TABLES,
  DEMO_USERS,
  ROLE_LABEL,
  type Status,
  type Table,
} from "@/lib/demo";

const STATUS: Record<Status, { label: string; card: string; chip: string }> = {
  libre: {
    label: "Libre",
    card: "border-tinta/20 bg-white/50 text-tinta/60",
    chip: "bg-tinta/10 text-tinta",
  },
  consumo: {
    label: "En consumo",
    card: "border-ocre bg-white text-tinta",
    chip: "bg-ocre text-tinta",
  },
  cuenta: {
    label: "Pidió la cuenta",
    card: "border-achiote bg-achiote text-white",
    chip: "bg-white text-achiote",
  },
  pagada: {
    label: "Pagada",
    card: "border-hoja bg-white text-tinta",
    chip: "bg-hoja text-white",
  },
};

function TableCard({ table }: { table: Table }) {
  const s = STATUS[table.status];
  return (
    <article
      className={`flex min-h-36 flex-col justify-between rounded-2xl border-2 p-4 ${s.card}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-5xl font-black leading-none">{table.name}</h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.chip}`}>{s.label}</span>
      </div>
      <p className="text-sm font-semibold opacity-80">{table.waiter?.name ?? "Sin mesera"}</p>
    </article>
  );
}

async function signOut() {
  "use server";
  if (DEMO) {
    (await cookies()).delete("sazon_demo_user");
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export default async function MesasPage() {
  let tables: Table[] = DEMO_TABLES;
  let who = "";

  if (DEMO) {
    const email = (await cookies()).get("sazon_demo_user")?.value;
    const user = DEMO_USERS.find((u) => u.email === email);
    if (!user) redirect("/login");
    who = `${user.name} · ${ROLE_LABEL[user.role]}`;
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("id, name, status, waiter:profiles(name)")
      .order("id");

    if (error) throw new Error("No se pudieron cargar las mesas.");
    tables = (data ?? []) as unknown as Table[];
  }

  return (
    <main className="mx-auto max-w-5xl p-5 sm:p-8">
      {!DEMO && <RealtimeRefresh table="restaurant_tables" />}
      <header className="mb-6 flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl font-black leading-none">Sazón de Barrio</h1>
        <div className="flex items-center gap-3">
          {who && <span className="text-sm font-semibold text-achiote">{who}</span>}
          <form action={signOut}>
            <button className="rounded-xl border-2 border-tinta px-4 py-2 font-bold">Salir</button>
          </form>
        </div>
      </header>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tables.map((t) => (
          <TableCard key={t.id} table={t} />
        ))}
      </section>
    </main>
  );
}
