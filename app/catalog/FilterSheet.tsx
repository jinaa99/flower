"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  /** Идэвхтэй шүүлтүүр байхгүй үед undefined — «Арилгах» нуугдана */
  onClear?: () => void;
  children: ReactNode;
};

/**
 * Mobile-ийн шүүлтүүр: доороос гулсаж гарах native <dialog> (focus trap, Esc үнэгүй).
 * Нээх/хаах transition нь @starting-style + transition-behavior: allow-discrete-ээр.
 */
export function FilterSheet({ open, onClose, resultCount, onClear, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Ард байгаа хуудас гүйхгүй
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    // Desktop өргөн рүү шилжвэл хажуугийн самбар харагдана — sheet хэрэггүй
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => desktop.matches && onClose();
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = prev;
      desktop.removeEventListener("change", onResize);
    };
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="filter-sheet-title"
      onClose={onClose}
      // Backdrop дээр дарвал хаагдана (дотор талын контент dialog-ийг бүрэн дүүргэдэг)
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="top-auto m-0 max-h-[85dvh] w-full max-w-none translate-y-full border-t border-gold-soft/25 bg-plum-950 p-0 text-ivory shadow-[0_-24px_60px_-20px_rgb(0_0_0/0.6)] transition-[translate,display,overlay] transition-discrete duration-500 ease-bloom open:translate-y-0 starting:open:translate-y-full backdrop:bg-plum-950/70 backdrop:opacity-0 backdrop:backdrop-blur-sm backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-500 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 lg:hidden"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="relative flex items-center justify-between border-b border-ivory/10 px-6 pt-5 pb-4">
          <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-ivory/15" />
          <h2 id="filter-sheet-title" className="font-display text-3xl font-light">
            Шүүлтүүр
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Хаах"
            className="flex size-10 items-center justify-center text-2xl text-ivory/60 transition-colors hover:text-blush-100"
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 py-8">
          {children}
        </div>

        <div className="flex items-center gap-3 border-t border-ivory/10 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="px-2 py-3.5 text-xs tracking-[0.2em] text-ivory/60 uppercase transition-colors hover:text-blush-100"
            >
              Арилгах
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex-1 btn-primary tabular-nums"
          >
            {resultCount ? `${resultCount} цэцэг харах` : "Үр дүн алга"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
