export default function Loading() {
  return (
    <section
      aria-busy="true"
      className="mx-auto max-w-7xl px-4 pt-[calc(var(--header-height)+6rem)] pb-32 sm:px-8"
    >
      <div className="h-3 w-24 bg-ivory/5" />
      <div className="mt-6 h-16 w-2/3 max-w-md bg-ivory/5" />
      <span className="sr-only">Ачаалж байна…</span>
    </section>
  );
}
