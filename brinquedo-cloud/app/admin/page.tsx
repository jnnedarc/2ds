import { createClient } from "@/utils/supabase/server";
import { cadastrarProduto, ajustarEstoque, alternarAtivo } from "@/app/actions";
import { moeda } from "@/lib/format";
import type { Categoria, Produto, VendaCategoria } from "@/types";

type Props = { searchParams: Promise<{ ok?: string; erro?: string; estoque?: string; ativo?: string }> };

export const instant = false;

export default async function AdminPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: catData } = await supabase.from("categorias").select("id, nome").order("nome");
  const { data: prodData, error } = await supabase
    .from("produtos")
    .select("id, nome, descricao, preco, estoque, idade_minima, ativo, categoria_id, categorias(nome)")
    .order("nome");
  const { data: relData } = await supabase
    .from("vw_vendas_por_categoria")
    .select("categoria, unidades, receita");

  const categorias = (catData ?? []) as Categoria[];
  const produtos = (prodData ?? []) as unknown as Produto[];
  const relatorio = (relData ?? []) as VendaCategoria[];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel do Administrador</h1>
      <p className="text-slate-500">INSERT de produtos, UPDATE de estoque e relatório com VIEW</p>

      {sp.erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{sp.erro}</p>
      )}
      {(sp.ok || sp.estoque || sp.ativo) && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Alteração salva com sucesso.
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</p>
      )}

      <form action={cadastrarProduto} className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">Novo brinquedo</h2>
        <input name="nome" placeholder="Nome do brinquedo" required className="rounded-lg border p-2" />
        <select name="categoria_id" required className="rounded-lg border p-2">
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <input name="descricao" placeholder="Descrição" className="rounded-lg border p-2 sm:col-span-2" />
        <input name="preco" type="number" step="0.01" min="0.01" placeholder="Preço (ex.: 99.90)" required className="rounded-lg border p-2" />
        <input name="estoque" type="number" min="0" defaultValue={0} required className="rounded-lg border p-2" />
        <input name="idade_minima" type="number" min="0" defaultValue={3} className="rounded-lg border p-2" />
        <button className="rounded-lg bg-indigo-600 p-2 text-white sm:col-span-2">Cadastrar produto</button>
      </form>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Situação</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.nome}</td>
                <td className="p-3">{p.categorias?.nome}</td>
                <td className="p-3">{moeda(p.preco)}</td>
                <td className="p-3">
                  <form action={ajustarEstoque} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="number"
                      name="estoque"
                      min={0}
                      defaultValue={p.estoque}
                      className="w-20 rounded border p-1"
                    />
                    <button className="rounded border px-2 py-1">Salvar</button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={alternarAtivo} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="ativo" value={String(!p.ativo)} />
                    <span className={p.ativo ? "text-emerald-700" : "text-slate-400"}>
                      {p.ativo ? "ativo" : "inativo"}
                    </span>
                    <button className="rounded border px-2 py-1">
                      {p.ativo ? "Desativar" : "Ativar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Vendas por categoria (VIEW)</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {relatorio.map((r) => (
            <li key={r.categoria} className="flex justify-between border-b py-1">
              <span>{r.categoria}</span>
              <span className="text-slate-600">{r.unidades} un · {moeda(r.receita)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">Pedidos cancelados não entram na receita.</p>
      </div>
    </div>
  );
}