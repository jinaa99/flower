import { z } from "zod";
import {
  CARD_MAX_LENGTH,
  greenery,
  MAX_GREENERY,
  MAX_STEMS,
  papers,
  ribbons,
  type GreeneryId,
  type PaperId,
  type RibbonId,
} from "@/data/bouquet";
import { flowerSlugs, type BouquetSize } from "@/data/flowers";
import { MAX_QUANTITY } from "@/lib/cart";
import { districts, type District } from "@/lib/delivery";

/*
 * Checkout-ийн validation — form (react-hook-form) болон route handler хоёулаа энэ schema-г
 * ашиглана. Transform-ууд idempotent: client-ийн parse хийсэн утгыг сервер дахин parse хийж болно.
 */

export const paymentMethods = [
  { id: "qpay", label: "QPay", description: "Банкны аппаар QR код уншуулж төлнө" },
  { id: "transfer", label: "Дансаар шилжүүлэх", description: "Гүйлгээний утгад захиалгын дугаараа бичнэ" },
] as const;

export type PaymentMethod = (typeof paymentMethods)[number]["id"];

const tuple = <T extends string>(values: readonly T[]) => values as [T, ...T[]];

/** «9911 2233», «9911-2233», «+976 99112233» → «99112233». Монгол дугаар: 8 орон, 6–9-өөр эхэлнэ */
export const phoneSchema = z
  .string()
  .transform((v) => v.replace(/[\s\-()]/g, "").replace(/^\+?976(?=\d{8}$)/, ""))
  .pipe(
    z
      .string()
      .min(1, "Утасны дугаараа оруулна уу")
      .regex(/^\d+$/, "Зөвхөн тоо оруулна уу")
      .length(8, "Утасны дугаар 8 оронтой байна")
      .regex(/^[6-9]/, "Монгол дугаар 6, 7, 8, 9-өөр эхэлнэ"),
  );

const personName = z.string().trim().min(2, "Нэрээ бүтэн оруулна уу").max(60, "Нэр хэт урт байна");

export const checkoutSchema = z
  .object({
    recipientName: personName,
    recipientPhone: phoneSchema,
    district: z.enum(tuple(districts.map((d) => d.name)), "Дүүргээ сонгоно уу"),
    // <select>-ийн утга string — тоо болгоно (дахин parse хийхэд тоо хэвээр)
    khoroo: z.coerce.number("Хороогоо сонгоно уу").int().min(1, "Хороогоо сонгоно уу"),
    address: z
      .string()
      .trim()
      .min(5, "Байр, орц, давхар, тоот зэргийг дэлгэрэнгүй бичнэ үү")
      .max(240, "Хаяг хэт урт байна"),
    deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Хүргэх өдрөө сонгоно уу"),
    // Завсрууд DB-д (`DeliverySlot`) — байгаа эсэхийг сервер захиалга үүсгэхдээ шалгана
    deliverySlot: z.string("Хүргэх цагаа сонгоно уу").regex(/^[\w-]{1,20}$/, "Хүргэх цагаа сонгоно уу"),
    cardMessage: z.string().trim().max(CARD_MAX_LENGTH, `Картын бичвэр ${CARD_MAX_LENGTH} тэмдэгтээс ихгүй`),
    senderName: personName,
    senderPhone: phoneSchema,
    anonymous: z.boolean(),
    payment: z.enum(tuple(paymentMethods.map((p) => p.id)), "Төлбөрийн хэлбэрээ сонгоно уу"),
  })
  .refine((v) => v.khoroo <= (districts.find((d) => d.name === v.district)?.khoroo ?? 0), {
    path: ["khoroo"],
    error: "Энэ дүүрэгт ийм хороо байхгүй",
  });

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutValues = z.output<typeof checkoutSchema>;
export type { District };

const quantity = z.number().int().min(1).max(MAX_QUANTITY);

/** POST /api/orders — сагсны агуулга + checkout form. Үнийг сервер дахин тооцно. */
export const orderRequestSchema = z
  .object({
    customer: checkoutSchema,
    items: z
      .array(
        z.object({
          slug: z.enum(flowerSlugs),
          size: z.enum(tuple<BouquetSize>(["Жижиг", "Дунд", "Том"])),
          quantity,
        }),
      )
      .max(50),
    bouquets: z
      .array(
        z.object({
          stems: z
            .array(z.object({ slug: z.enum(flowerSlugs), color: z.number().int().min(0), count: z.number().int().min(1).max(MAX_STEMS) }))
            .min(1)
            .max(MAX_STEMS),
          greenery: z.partialRecord(
            z.enum(tuple<GreeneryId>(greenery.map((g) => g.id))),
            z.number().int().min(0).max(MAX_GREENERY),
          ),
          paper: z.enum(tuple<PaperId>(papers.map((p) => p.id))),
          ribbon: z.enum(tuple<RibbonId>(ribbons.map((r) => r.id))),
          message: z.string().max(CARD_MAX_LENGTH),
          quantity,
        }),
      )
      .max(20),
    /** Client-ийн харсан нийт дүн — серверийн тооцоотой зөрвөл захиалга үүсгэхгүй */
    expectedTotal: z.number().int().min(0),
  })
  .refine((v) => v.items.length + v.bouquets.length > 0, { error: "Сагс хоосон байна" });

export type OrderRequest = z.output<typeof orderRequestSchema>;

/** POST /api/orders-ийн хариу */
export type OrderResponse =
  | { ok: true; id: string; number: string }
  | {
      ok: false;
      code: "invalid" | "unavailable" | "delivery" | "price_changed";
      message: string;
      /** price_changed: custom баглаа тус бүрийн одоогийн үнэ (хүсэлтийн дарааллаар) */
      bouquetPrices?: number[];
    };

/** «99112233» → «9911 2233» */
export const formatPhone = (phone: string) => phone.replace(/^(\d{4})(\d{4})$/, "$1 $2");
