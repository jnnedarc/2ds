import { createClient } from "@/utils/supabase/server";
import { cadastrarCliente } from "@/app/actions";
import { dataHora } from "@/lib/format";
import type { Cliente } from "@/types";

type Props = { searchParams: Promise<{ ok?: string; erro?: string }> };

export const instant = false;

export default async function ClientesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, email, telefone, criado_em")
    .order("nome");

  const clientes = (data ?? []) as Cliente[];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>

      {sp.ok && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Cliente cadastrado.
        </p>
      )}
      {sp.erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{sp.erro}</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
      )}

      <form action={cadastrarCliente} className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-3">
        <input name="nome" placeholder="Nome completo" required className="rounded-lg border p-2" />
        <input name="email" type="email" placeholder="E-mail" required className="rounded-lg border p-2" />
        <input name="telefone" placeholder="(11) 90000-0000" className="rounded-lg border p-2" />
        <button className="rounded-lg bg-indigo-600 p-2 text-white sm:col-span-3">Cadastrar cliente</button>
      </form>

      <ul className="space-y-2">
        {clientes.map((c) => (
          <li key={c.id} className="rounded-xl border bg-white p-3">
            <strong>{c.nome}</strong> · {c.email} · {c.telefone ?? "sem telefone"}
            <span className="ml-2 text-xs text-slate-400">desde {dataHora(c.criado_em)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}