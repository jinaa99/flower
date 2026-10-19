import type { ReactNode } from "react";
import { FREE_DELIVERY_FROM } from "@/lib/delivery";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const promises: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Өдөрт нь хүргэлт",
    body: "Улаанбаатар хотод захиалснаас хойш 3 цагийн дотор, сонгосон цагт тань.",
    icon: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.6" />
        <circle cx="17.5" cy="17.5" r="1.6" />
      </>
    ),
  },
  {
    title: "Тансаг боодол",
    body: "Гар урлалын цаас, торгон тууз, бэлгийн карт — баглаа бүр бэлэг мэт.",
    icon: (
      <>
        <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" />
        <path d="M12 7c-1.5-3-5-3.5-5-1.2C7 7 10 7 12 7Zm0 0c1.5-3 5-3.5 5-1.2C17 7 14 7 12 7Z" />
      </>
    ),
  },
  {
    title: "Тохиолдол бүрд",
    body: "Төрсөн өдөр, хурим, талархал, эмгэнэл — мөч бүрд тохирох цэцэг.",
    icon: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  },
];

/** «Аз жаргал хүргэнэ»: хүргэлт, боодол, тохиолдлын амлалт */
export function DeliverySection() {
  return (
    <section id="delivery" className="relative scroll-mt-(--header-height) py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="Үйлчилгээ"
          title={["Аз жаргал ", "хүргэнэ", ""]}
          body={`${formatPrice(FREE_DELIVERY_FROM)}-өөс дээш захиалгад хүргэлт үнэгүй.`}
          className="max-w-2xl"
        />
        <ul className="mt-20 grid gap-6 md:grid-cols-3">
          {promises.map((p) => (
            <li
              key={p.title}
              className="group relative overflow-hidden rounded-[2rem] border border-ivory/10 bg-[radial-gradient(circle_at_100%_0%,rgb(217_87_126/0.14),transparent_55%)] p-8 transition-colors duration-700 hover:border-blush-300/30 sm:p-10"
            >
              <span className="relative flex size-14 items-center justify-center rounded-full border border-gold-soft/30 text-gold-soft">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6"
                >
                  {p.icon}
                </svg>
              </span>
              <h3 className="relative mt-8 font-display text-3xl font-light">{p.title}</h3>
              <p className="relative mt-3 leading-relaxed text-ivory/55">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
