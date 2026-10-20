"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEMO, DEMO_PASSWORD, DEMO_USERS, ROLE_LABEL } from "@/lib/demo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));

    if (DEMO) {
      const user = DEMO_USERS.find((u) => u.email === email);
      if (!user || password !== DEMO_PASSWORD) {
        setError("Correo o contraseña incorrectos.");
        return;
      }
      document.cookie = `sazon_demo_user=${encodeURIComponent(user.email)}; path=/; max-age=28800; samesite=lax`;
      router.replace("/mesas");
      return;
    }

    setLoading(true);
    const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.replace("/mesas");
    router.refresh();
  }

  const field =
    "mt-1 w-full rounded-xl border-2 border-tinta bg-white px-4 py-3 text-lg outline-none focus:border-achiote";

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
        <h1 className="font-display text-7xl font-black leading-[0.9]">
          Sazón
          <br />
          de Barrio
        </h1>
        {DEMO && (
          <div className="space-y-1 rounded-xl border-2 border-tinta/20 bg-white p-4 text-sm">
            <p className="font-bold">Cuentas de prueba · contraseña: {DEMO_PASSWORD}</p>
            {DEMO_USERS.map((u) => (
              <p key={u.email}>
                {ROLE_LABEL[u.role]}: {u.email}
              </p>
            ))}
          </div>
        )}
        <label className="block">
          <span className="font-semibold">Correo</span>
          <input name="email" type="email" required autoComplete="username" className={field} />
        </label>
        <label className="block">
          <span className="font-semibold">Contraseña</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={field}
          />
        </label>
        {error && (
          <p role="alert" className="font-semibold text-achiote">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-tinta py-3 text-lg font-bold text-papel disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
