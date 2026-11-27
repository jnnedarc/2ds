import Link from "next/link";
import { ToyBrick, ShoppingCart, Users, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Catálogo", Icon: ToyBrick },
  { href: "/pedidos", label: "Pedidos", Icon: ShoppingCart },
  { href: "/clientes", label: "Clientes", Icon: Users },
  { href: "/admin", label: "Admin", Icon: Settings },
];

export default function Nav() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 p-4">
        <Link href="/" className="mr-4 text-lg font-bold">
          🧸 Brinquedo Cloud
        </Link>
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}