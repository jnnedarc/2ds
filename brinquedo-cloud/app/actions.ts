"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const int = (v: FormDataEntryValue | null) => Number(txt(v));
const dec = (v: FormDataEntryValue | null) => Number(txt(v).replace(",", "."));

function falhar(path: string, msg: string) {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}erro=${encodeURIComponent(msg)}`);
}

/* ---------------- COMPRAR (RPC transacional) ---------------- */
export async function comprar(formData: FormData) {
  const produtoId = int(formData.get("produto_id"));
  const clienteId = int(formData.get("cliente_id"));
  const quantidade = int(formData.get("quantidade"));
  const pagina = `/produto/${produtoId}`;

  if (!Number.isInteger(produtoId) || produtoId <= 0) falhar("/", "Produto inválido.");
  if (!Number.isInteger(clienteId) || clienteId <= 0) falhar(pagina, "Escolha um cliente.");
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99)
    falhar(pagina, "A quantidade deve ser um número inteiro entre 1 e 99.");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("comprar", {
    p_cliente_id: clienteId,
    p_produto_id: produtoId,
    p_quantidade: quantidade,
  });

  if (error) falhar(pagina, error.message);

  revalidatePath("/");
  revalidatePath("/pedidos");
  revalidatePath("/admin");
  revalidatePath(pagina);
  redirect(`/pedidos?ok=${Number(data)}`);
}

/* ---------------- CANCELAR PEDIDO ---------------- */
export async function cancelarPedido(formData: FormData) {
  const id = int(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) falhar("/pedidos", "Pedido inválido.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancelar_pedido", { p_pedido_id: id });
  if (error) falhar("/pedidos", error.message);

  revalidatePath("/pedidos");
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/pedidos?cancelado=1");
}

/* ---------------- CADASTRAR CLIENTE ---------------- */
export async function cadastrarCliente(formData: FormData) {
  const nome = txt(formData.get("nome"));
  const email = txt(formData.get("email")).toLowerCase();
  const telefone = txt(formData.get("telefone")) || null;

  if (nome.length < 3) falhar("/clientes", "Informe o nome completo (mínimo 3 letras).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) falhar("/clientes", "E-mail inválido.");

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").insert({ nome, email, telefone });

  if (error) {
    falhar("/clientes", error.code === "23505" ? "Já existe um cliente com este e-mail." : error.message);
  }

  revalidatePath("/clientes");
  redirect("/clientes?ok=1");
}

/* ---------------- CADASTRAR PRODUTO ---------------- */
export async function cadastrarProduto(formData: FormData) {
  const nome = txt(formData.get("nome"));
  const descricao = txt(formData.get("descricao")) || null;
  const categoriaId = int(formData.get("categoria_id"));
  const preco = dec(formData.get("preco"));
  const estoque = int(formData.get("estoque") ?? "0");
  const idadeMinima = int(formData.get("idade_minima") ?? "0");

  if (nome.length < 3) falhar("/admin", "Informe o nome do produto.");
  if (!Number.isInteger(categoriaId) || categoriaId <= 0) falhar("/admin", "Escolha uma categoria.");
  if (!Number.isFinite(preco) || preco <= 0) falhar("/admin", "Preço deve ser maior que zero.");
  if (!Number.isInteger(estoque) || estoque < 0) falhar("/admin", "Estoque não pode ser negativo.");
  if (!Number.isInteger(idadeMinima) || idadeMinima < 0) falhar("/admin", "Idade mínima inválida.");

  const supabase = await createClient();
  const { error } = await supabase.from("produtos").insert({
    nome,
    descricao,
    categoria_id: categoriaId,
    preco: Number(preco.toFixed(2)),
    estoque,
    idade_minima: idadeMinima,
  });

  if (error) falhar("/admin", error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?ok=1");
}

/* ---------------- AJUSTAR ESTOQUE (UPDATE) ---------------- */
export async function ajustarEstoque(formData: FormData) {
  const id = int(formData.get("id"));
  const estoque = int(formData.get("estoque"));

  if (!Number.isInteger(id) || id <= 0) falhar("/admin", "Produto inválido.");
  if (!Number.isInteger(estoque) || estoque < 0) falhar("/admin", "Estoque não pode ser negativo.");

  const supabase = await createClient();
  const { error } = await supabase.from("produtos").update({ estoque }).eq("id", id);
  if (error) falhar("/admin", error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?estoque=1");
}

/* ---------------- ATIVAR / DESATIVAR PRODUTO ---------------- */
export async function alternarAtivo(formData: FormData) {
  const id = int(formData.get("id"));
  const ativo = txt(formData.get("ativo")) === "true";

  if (!Number.isInteger(id) || id <= 0) falhar("/admin", "Produto inválido.");

  const supabase = await createClient();
  const { error } = await supabase.from("produtos").update({ ativo }).eq("id", id);
  if (error) falhar("/admin", error.message);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?ativo=1");
}