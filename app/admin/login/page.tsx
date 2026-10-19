import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Нэвтрэх" };

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <div className="mx-auto max-w-sm py-16">
      <p className="mb-6 text-xs tracking-[0.3em] text-gold-soft uppercase">Admin</p>
      <h1 className="mb-12 font-display text-5xl font-light">Нэвтрэх</h1>
      <Suspense fallback={<LoginForm next="" />}>
        <WithNext searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function WithNext({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : ""} />;
}
