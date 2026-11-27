import Link from "next/link";
import { Package, Tags, Boxes } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { moeda, emojiCategoria } from "@/lib/format";
import type { Categoria, Produto } from "@/types";

type Props = { searchParams: Promise<{ categoria?: string; busca?: string; erro?: string }> };

export const instant = false;

export default async function Catalogo({ searchParams }: Props) {
  const sp = await searchParams;
  const categoriaId = Number(sp.categoria);
  const busca = (sp.busca ?? "").trim();

  const supabase = await createClient();

  const { data: catData } = await supabase.from("categorias").select("id, nome").order("nome");

  // filtros aplicados antes do .order() para manter a tipagem do builder
  let query = supabase
    .from("produtos")
    .select("id, nome, descricao, preco, estoque, idade_minima, categoria_id, categorias(nome)")
    .eq("ativo", true);

  if (Number.isInteger(categoriaId) && categoriaId > 0) query = query.eq("categoria_id", categoriaId);
  if (busca) query = query.ilike("nome", `%${busca}%`);

  const { data, error } = await query.order("nome");

  const categorias = (catData ?? []) as Categoria[];
  const produtos = (data ?? []) as unknown as Produto[];
  const unidades = produtos.reduce((s, p) => s + p.estoque, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loja de Brinquedos</h1>
        <p className="text-slate-500">Catálogo em nuvem com PostgreSQL no Supabase</p>
      </div>

      {sp.erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{sp.erro}</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Erro ao buscar produtos: {error.message}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card Icon={Package} titulo="Produtos ativos" valor={produtos.length} />
        <Card Icon={Tags} titulo="Categorias" valor={categorias.length} />
        <Card Icon={Boxes} titulo="Unidades em estoque" valor={unidades} />
      </section>

      <form method="get" className="flex flex-wrap gap-2">
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar brinquedo pelo nome"
          className="flex-1 rounded-lg border p-2"
        />
        {Number.isInteger(categoriaId) && categoriaId > 0 && (
          <input type="hidden" name="categoria" value={categoriaId} />
        )}
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Buscar</button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href="/" className="rounded-full border bg-white px-3 py-1 text-sm">Todas</Link>
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/?categoria=${c.id}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              categoriaId === c.id ? "bg-indigo-600 text-white" : "bg-white"
            }`}
          >
            {emojiCategoria(c.nome)} {c.nome}
          </Link>
        ))}
      </div>

      {produtos.length === 0 ? (
        <p className="rounded-xl border bg-white p-8 text-center text-slate-500">
          Nenhum brinquedo encontrado.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((p) => (
            <li key={p.id} className="flex flex-col rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 flex h-28 items-center justify-center rounded-xl bg-indigo-50 text-5xl">
                {emojiCategoria(p.categorias?.nome)}
              </div>
              <span className="text-xs text-slate-500">{p.categorias?.nome}</span>
              <h2 className="font-semibold">{p.nome}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.descricao}</p>
              <p className="mt-3 text-xl font-bold text-indigo-700">{moeda(p.preco)}</p>
              <p className="text-xs text-slate-500">
                {p.estoque > 0 ? `${p.estoque} em estoque` : "Esgotado"} · idade {p.idade_minima}+
              </p>
              <Link
                href={`/produto/${p.id}`}
                className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm text-white"
              >
                Ver e comprar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Card({
  Icon, titulo, valor,
}: { Icon: typeof Package; titulo: string; valor: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
      <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon size={20} /></span>
      <div>
        <p className="text-sm text-slate-500">{titulo}</p>
        <p className="text-2xl font-bold">{valor}</p>
      </div>
    </div>
  );
}