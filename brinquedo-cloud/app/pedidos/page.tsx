import { createClient } from "@/utils/supabase/server";
import { cancelarPedido } from "@/app/actions";
import { moeda, dataHora } from "@/lib/format";
import type { Pedido } from "@/types";

type Props = { searchParams: Promise<{ ok?: string; erro?: string; cancelado?: string }> };

const cor: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  pago: "bg-emerald-100 text-emerald-800",
  enviado: "bg-blue-100 text-blue-800",
  entregue: "bg-slate-200 text-slate-700",
  cancelado: "bg-red-100 text-red-700",
};

export const instant = false;

export default async function PedidosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pedidos")
    .select("id, criado_em, status, total, clientes(nome, email), itens_pedido(quantidade, preco_unitario, produtos(nome))")
    .order("criado_em", { ascending: false });

  const pedidos = (data ?? []) as unknown as Pedido[];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pedidos</h1>
      <p className="text-slate-500">SELECT com JOIN entre pedidos, clientes, itens e produtos</p>

      {sp.ok && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Pedido {sp.ok} registrado com sucesso e estoque atualizado.
        </p>
      )}
      {sp.cancelado && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Pedido cancelado e itens devolvidos ao estoque.
        </p>
      )}
      {sp.erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{sp.erro}</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
      )}

      {pedidos.length === 0 ? (
        <p className="rounded-xl border bg-white p-8 text-center text-slate-500">Nenhum pedido ainda.</p>
      ) : (
        <ul className="space-y-3">
          {pedidos.map((p) => (
            <li key={p.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Pedido {p.id} · {p.clientes?.nome}</p>
                  <p className="text-xs text-slate-500">{dataHora(p.criado_em)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs ${cor[p.status] ?? "bg-slate-100"}`}>
                    {p.status}
                  </span>
                  <span className="font-bold text-indigo-700">{moeda(p.total)}</span>
                </div>
              </div>

              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {(p.itens_pedido ?? []).map((i, idx) => (
                  <li key={`${p.id}-${idx}`}>
                    {i.quantidade}x {i.produtos?.nome ?? "produto removido"} — {moeda(i.preco_unitario)} cada
                  </li>
                ))}
              </ul>

              {p.status !== "cancelado" && (
                <form action={cancelarPedido} className="mt-3">
                  <input type="hidden" name="id" value={p.id} />
                  <button className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-700">
                    Cancelar pedido
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}