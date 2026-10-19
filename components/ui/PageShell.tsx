import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function PageShell({ eyebrow, title, subtitle, children }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-[calc(var(--header-height)+6rem)] pb-32 sm:px-8">
      {eyebrow && (
        <p className="mb-6 text-xs tracking-[0.3em] text-gold-soft uppercase">{eyebrow}</p>
      )}
      <h1 className="font-display text-5xl leading-[1.05] font-light text-ivory sm:text-7xl">
        {title}
      </h1>
      {subtitle && <p className="mt-6 max-w-xl text-lg text-ivory/60">{subtitle}</p>}
      {children && <div className="mt-16">{children}</div>}
    </section>
  );
}
