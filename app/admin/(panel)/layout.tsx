import Link from "next/link";
import { logout } from "../actions";

const nav = [
  { href: "/admin", label: "Захиалга" },
  { href: "/admin/flowers", label: "Цэцэг, нөөц" },
] as const;

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-ivory/10 pb-6">
        <div>
          <p className="mb-3 text-xs tracking-[0.3em] text-gold-soft uppercase">Admin</p>
          <nav className="flex gap-8 font-display text-2xl font-light">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="transition-colors hover:text-blush-100">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs tracking-[0.2em] text-ivory/50 uppercase transition-colors hover:text-blush-100"
          >
            Гарах
          </button>
        </form>
      </div>
      {children}
    </>
  );
}
