import Link from "next/link";
import { brand } from "@/lib/brand";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Дэлгүүр",
    links: [
      { href: "/catalog", label: "Бүх цэцэг" },
      { href: "/bouquet-builder", label: "Баглаа бүрдүүлэх" },
      { href: "/cart", label: "Сагс" },
    ],
  },
  {
    title: "Ателье",
    links: [
      { href: "/#language", label: "Цэцгийн хэл" },
      { href: "/#collection", label: "Цуглуулга" },
      { href: "/#delivery", label: "Хүргэлт" },
    ],
  },
] as const;

/** Бүх хуудасны footer: logo, богино танилцуулга, холбоос, ажлын цаг */
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-ivory/10 bg-plum-950">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-blush-300/30 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" aria-label={`${brand.name} — нүүр хуудас`}>
            <Logo />
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory/50">{brand.tagline}</p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-5 text-[0.65rem] tracking-[0.35em] text-gold-soft uppercase">{col.title}</h2>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ivory/65 transition-colors hover:text-blush-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div>
          <h2 className="mb-5 text-[0.65rem] tracking-[0.35em] text-gold-soft uppercase">Хүргэлт</h2>
          <p className="text-sm leading-relaxed text-ivory/65">
            Улаанбаатар хот дотор
            <br />
            Өдөр бүр 10:00 – 22:00
          </p>
          <p className="mt-4 text-sm text-ivory/45">Төлбөр: QPay, дансаар шилжүүлэх</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-ivory/5 px-4 py-6 text-xs text-ivory/35 sm:px-8">
        <p>
          © {brand.company}
        </p>
        <p>Цэцгийн зургууд: Unsplash</p>
      </div>
    </footer>
  );
}
