import { z } from "zod";

export const categories = [
  "المطبخ",
  "النيش",
  "المفروشات",
  "الأجهزة الكهربائية",
  "اللانجيري والملابس",
  "الرفايع",
];
export const modules = [
  ["dashboard", "الرئيسية"],
  ["gihaz", "نوتة الجهاز"],
  ["wedding", "حجوزات الفرح"],
  ["glowup", "العناية والـ Glow Up"],
  ["diet", "الدايت والسعرات"],
  ["guests", "المعازيم"],
  ["songs", "أغاني الفرح"],
  ["budget", "الخزنة والميزانية"],
  ["settings", "إعدادات حسابي"],
] as const;
const short = z.string().trim().max(200);
const money = z.number().finite().min(0).max(1e8);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => !isNaN(Date.parse(v)), "تاريخ غير صالح");
export const itemSchema = z
  .object({
    id: z.string().max(100),
    kind: z.enum(["gihaz", "wedding", "glowup", "guests", "songs", "water"]),
    name: short.min(1),
    category: short.default(""),
    quantity: z.number().int().min(1).max(10000).default(1),
    bought: z.number().int().min(0).max(10000).default(0),
    price: money.default(0),
    paid: money.default(0),
    color: short.default(""),
    store: short.default(""),
    phone: short.default(""),
    date: z.union([date, z.literal("")]).default(""),
    done: z.boolean().default(false),
    offset: z.number().int().min(0).max(730).default(30),
    confirmed: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "gihaz" && v.bought > v.quantity)
      ctx.addIssue({ code: "custom", message: "المشترى لا يتجاوز المطلوب" });
    if (v.kind === "wedding" && v.paid > v.price)
      ctx.addIssue({ code: "custom", message: "المدفوع لا يتجاوز الإجمالي" });
    if (v.kind === "water" && v.bought > 12)
      ctx.addIssue({ code: "custom", message: "الحد الأقصى 12 كوبًا" });
  });
export type Item = z.infer<typeof itemSchema>;
export const sectionDefaults = {
  gihaz: {
    title: "نوتة الجهاز",
    description: "من أول طقم حلل.. لآخر تفصيلة في بيتك الجديد.",
    image: "/images/gihaz.jpg",
  },
  wedding: {
    title: "حجوزات الفرح",
    description: "القاعة، الميكب والتصوير.. كل حجز وميعاده ومدفوعاته.",
    image: "/images/wedding.jpg",
  },
  glowup: {
    title: "العناية بنفسك",
    description: "مواعيد وخطوات صغيرة للاهتمام بنفسك، من غير ضغط.",
    image: "/images/glowup.jpg",
  },
  diet: {
    title: "التغذية والمياه",
    description: "متابعة بسيطة لعاداتك، ومعلومات عامة عن احتياجك اليومي.",
    image: "/images/diet.jpg",
  },
  guests: {
    title: "المعازيم",
    description: "رتّبي الدعوات وعدد الضيوف وأكّدي الحضور بسهولة.",
    image: "/images/guests.jpg",
  },
  songs: {
    title: "أغاني الفرح",
    description: "اختاري موسيقى كل لحظة.. من الدخلة لآخر رقصة.",
    image: "/images/songs.jpg",
  },
  budget: {
    title: "الخزنة والميزانية",
    description: "تابعي المدفوع والالتزامات والمتبقي في مكان واحد.",
    image: "/images/budget.jpg",
  },
  settings: {
    title: "إعدادات حسابي",
    description: "موعد فرحك وميزانيتك وبياناتك.. عدّليها وقت ما تحتاجي.",
    image: "/images/settings.jpg",
  },
};
export type SectionKey = keyof typeof sectionDefaults;
const sectionSchema = z.object({
  title: short.min(1),
  description: z.string().max(600),
  image: z.string().regex(/^\/images\/[a-zA-Z0-9_-]+\.jpg$/),
});
export const profileSchema = z.object({
  weddingDate: date,
  budget: money,
  weight: z.number().min(30).max(300),
  targetWeight: z.number().min(30).max(300),
  height: z.number().min(120).max(230),
  age: z.number().int().min(18).max(90),
  activity: z.union([
    z.literal(1.2),
    z.literal(1.375),
    z.literal(1.55),
    z.literal(1.725),
  ]),
});
export const configSchema = z.object({
  sections: z
    .object({
      gihaz: sectionSchema,
      wedding: sectionSchema,
      glowup: sectionSchema,
      diet: sectionSchema,
      guests: sectionSchema,
      songs: sectionSchema,
      budget: sectionSchema,
      settings: sectionSchema,
    })
    .default(sectionDefaults),
  brandName: short.min(1),
  heroTitle: short.min(1),
  heroSubtitle: z.string().max(600),
  welcome: short,
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  subscriptionPrice: money,
  instapayAddress: short.min(1),
  instapayReceiverName: short.min(1),
  supportWhatsapp: z.string().regex(/^\d{8,15}$/),
  enabledModules: z.array(
    z.enum(["gihaz", "wedding", "glowup", "diet", "guests", "songs", "budget"]),
  ),
  templates: z.array(itemSchema).max(300),
});
export type Config = z.infer<typeof configSchema>;
export const makeItem = (
  kind: Item["kind"],
  name: string,
  extra: Partial<Item> = {},
): Item => ({
  ...itemSchema.parse({
    id: crypto.randomUUID(),
    kind,
    name: name || "بند جديد",
    ...extra,
  }),
  name,
});
export const defaultConfig: Config = {
  sections: sectionDefaults,
  brandName: "عروستنا",
  heroTitle: "كل تفاصيل فرحك..\nفي مكان واحد",
  heroSubtitle:
    "وداعًا لكشاكيل الجهاز المبعثرة. نوتة جهازك، ميزانيتك، ومواعيدك — مساحة واحدة لكل تفاصيل اليوم اللي بتحلمي بيه.",
  welcome: "استمتعي بكل لحظة في التجهيز يا أجمل عروسة",
  primaryColor: "#717b65",
  bgColor: "#faf9f6",
  subscriptionPrice: 199,
  instapayAddress: "salmaeldebieky@instapay",
  instapayReceiverName: "Salma Eldebieky",
  supportWhatsapp: "201011949729",
  enabledModules: [
    "gihaz",
    "wedding",
    "glowup",
    "diet",
    "guests",
    "songs",
    "budget",
  ],
  templates: [
    makeItem("gihaz", "طقم حلل جرانيت / سيراميك", {
      category: "المطبخ",
      quantity: 2,
      price: 3250,
      color: "روز جولد",
      store: "حمام التلات",
    }),
    makeItem("gihaz", "طقم توابل دوار", {
      category: "المطبخ",
      price: 850,
      color: "ذهبي",
      store: "الموسكي",
    }),
    makeItem("gihaz", "طقم صيني 124 قطعة", {
      category: "النيش",
      price: 14000,
      color: "أبيض مذهب",
      store: "العتبة",
    }),
    makeItem("gihaz", "طقم ملايات سرير كبير قطن", {
      category: "المفروشات",
      quantity: 12,
      price: 600,
      color: "ألوان باستيل",
      store: "المحلة",
    }),
    makeItem("gihaz", "فوط قطن متنوعة المقاسات", {
      category: "المفروشات",
      quantity: 24,
      price: 150,
      color: "أوف وايت",
      store: "المحلة",
    }),
    makeItem("gihaz", "ثلاجة نوفروست 18 قدم", {
      category: "الأجهزة الكهربائية",
      price: 28000,
      store: "بي تك",
    }),
    makeItem("gihaz", "غسالة ملابس أوتوماتيك", {
      category: "الأجهزة الكهربائية",
      price: 21000,
      store: "العربي",
    }),
    makeItem("gihaz", "بيجامات قطن صيفي وشتوي", {
      category: "اللانجيري والملابس",
      quantity: 15,
      price: 400,
      store: "وسط البلد",
    }),
    makeItem("gihaz", "شماعات قطيفة + منظمات أدراج", {
      category: "الرفايع",
      price: 950,
      store: "النزهة الجديدة",
    }),
    makeItem("glowup", "استشارة طبيبة الجلدية وخطة العناية", {
      category: "قبل الفرح بـ 6 شهور",
      offset: 180,
    }),
    makeItem("glowup", "روتين البشرة والشعر", {
      category: "قبل الفرح بـ 3 شهور",
      offset: 90,
    }),
    makeItem("glowup", "موعد العناية بالبشرة", {
      category: "قبل الفرح بشهر",
      offset: 30,
    }),
    makeItem("glowup", "حمام مغربي", {
      category: "قبل الفرح بأسبوع",
      offset: 7,
    }),
    makeItem("glowup", "الأظافر وبروفة الطرحة", {
      category: "قبل الفرح بيومين",
      offset: 2,
    }),
  ],
};
export const dateBefore = (date: string, days: number) => {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
};
export const seedItems = (config: Config, wedding: string) =>
  config.templates.map((i) => ({
    ...i,
    id: crypto.randomUUID(),
    date: i.kind === "glowup" ? dateBefore(wedding, i.offset) : i.date,
  }));
export const localDay = () => new Date().toLocaleDateString("en-CA");
export const daysUntil = (date: string) =>
  Math.max(
    0,
    Math.round(
      (Date.parse(date + "T12:00:00") - Date.parse(localDay() + "T12:00:00")) /
        86400000,
    ),
  );
export const totals = (items: Item[], budget: number) => {
  const g = items.filter((i) => i.kind === "gihaz"),
    v = items.filter((i) => i.kind === "wedding");
  const bought = g.reduce((s, i) => s + i.price * i.bought, 0),
    vendorPaid = v.reduce((s, i) => s + i.paid, 0);
  const committed =
    g.reduce((s, i) => s + i.price * i.quantity, 0) +
    v.reduce((s, i) => s + i.price, 0);
  return {
    paid: bought + vendorPaid,
    committed,
    cash: budget - bought - vendorPaid,
    available: budget - committed,
    progress: g.length
      ? Math.round(
          (g.filter((i) => i.bought === i.quantity).length / g.length) * 100,
        )
      : 0,
    gihazPaid: bought,
    vendorPaid,
  };
};
export const moneyText = (v: number) =>
  new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 }).format(v);
