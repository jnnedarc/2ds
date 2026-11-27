import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { comprar } from "@/app/actions";
import { moeda, emojiCategoria } from "@/lib/format";
import type { Cliente, Produto } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
};

export const instant = false;

export default async function ProdutoPage({ params, searchParams }: Props) {
  const { id: idParam } = await params;
  const sp = await searchParams;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const supabase = await createClient();

  const { data } = await supabase
    .from("produtos")
    .select("id, nome, descricao, preco, estoque, idade_minima, ativo, categoria_id, categorias(nome)")
    .eq("id", id)
    .eq("ativo", true)
    .maybeSingle();

  if (!data) notFound();
  const produto = data as unknown as Produto;

  const { data: cliData } = await supabase.from("clientes").select("id, nome, email").order("nome");
  const clientes = (cliData ?? []) as Pick<Cliente, "id" | "nome" | "email">[];

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-indigo-600">← voltar ao catálogo</Link>

      {sp.erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{sp.erro}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-2xl border bg-white text-8xl">
          {emojiCategoria(produto.categorias?.nome)}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <span className="text-xs text-slate-500">{produto.categorias?.nome}</span>
          <h1 className="text-2xl font-bold">{produto.nome}</h1>
          <p className="mt-2 text-slate-600">{produto.descricao}</p>
          <p className="mt-4 text-3xl font-bold text-indigo-700">{moeda(produto.preco)}</p>
          <p className="text-sm text-slate-500">
            {produto.estoque > 0 ? `${produto.estoque} unidades disponíveis` : "Produto esgotado"} ·
            idade recomendada {produto.idade_minima}+
          </p>

          {produto.estoque === 0 ? (
            <p className="mt-6 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
              Sem estoque no momento. Reponha pelo painel Admin para testar a venda.
            </p>
          ) : clientes.length === 0 ? (
            <p className="mt-6 text-sm">
              Cadastre um cliente antes de comprar:{" "}
              <Link href="/clientes" className="text-indigo-600 underline">novo cliente</Link>
            </p>
          ) : (
            <form action={comprar} className="mt-6 grid gap-3">
              <input type="hidden" name="produto_id" value={produto.id} />

              <label className="text-sm font-medium" htmlFor="cliente_id">Cliente</label>
              <select id="cliente_id" name="cliente_id" required className="rounded-lg border p-2">
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.email})</option>
                ))}
              </select>

              <label className="text-sm font-medium" htmlFor="quantidade">Quantidade</label>
              <input
                id="quantidade"
                type="number"
                name="quantidade"
                defaultValue={1}
                min={1}
                max={Math.min(99, produto.estoque)}
                required
                className="rounded-lg border p-2"
              />

              <button className="rounded-lg bg-indigo-600 p-2 font-medium text-white">
                Finalizar compra
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}