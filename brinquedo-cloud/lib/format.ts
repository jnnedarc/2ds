export const moeda = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0));

export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

export const emojiCategoria = (nome?: string | null) => {
  const mapa: Record<string, string> = {
    "Blocos de Montar": "🧱",
    "Bonecas": "🪆",
    "Carrinhos": "🏎️",
    "Jogos de Tabuleiro": "🎲",
    "Pelúcias": "🧸",
    "Educativos": "🔬",
  };
  return (nome && mapa[nome]) || "🎁";
};