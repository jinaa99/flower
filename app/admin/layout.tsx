import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: { template: `%s · Admin · ${brand.name}`, default: `Admin · ${brand.name}` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="mx-auto max-w-7xl px-4 pt-[calc(var(--header-height)+3rem)] pb-32 sm:px-8">{children}</div>;
}
