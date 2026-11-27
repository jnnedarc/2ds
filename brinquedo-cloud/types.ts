export type Categoria = { id: number; nome: string };

export type Cliente = {
  id: number; nome: string; email: string; telefone: string | null; criado_em: string;
};

export type Produto = {
  id: number; nome: string; descricao: string | null;
  preco: number; estoque: number; idade_minima: number;
  ativo: boolean; categoria_id: number;
  categorias: { nome: string } | null;
};

export type ItemPedido = {
  quantidade: number; preco_unitario: number;
  produtos: { nome: string } | null;
};

export type Pedido = {
  id: number; criado_em: string; status: string; total: number;
  clientes: { nome: string; email: string } | null;
  itens_pedido: ItemPedido[];
};

export type VendaCategoria = { categoria: string; unidades: number; receita: number };
