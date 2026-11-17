import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Heart,
  ShoppingBag,
  Calendar,
  Sparkles,
  Utensils,
  Users,
  Music,
  Wallet,
  Settings,
  LogOut,
  ArrowUpLeft,
  Plus,
  Search,
  Check,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Droplets,
  Download,
  ShieldCheck,
} from "lucide-react";
import {
  Brand,
  Button,
  Empty,
  ErrorBox,
  Modal,
  PageTitle,
} from "../components/common";
import { ItemEditor } from "../components/item-editor";
import { ProfileForm, type ProfileData } from "../components/profile-form";
import {
  modules,
  categories,
  daysUntil,
  totals,
  moneyText,
  makeItem,
  localDay,
  dateBefore,
  type Config,
  type Item,
  type SectionKey,
} from "../../shared/planner";

const icons = [
  Heart,
  ShoppingBag,
  Calendar,
  Sparkles,
  Utensils,
  Users,
  Music,
  Wallet,
  Settings,
];
export interface WorkspaceProps {
  config: Config;
  name: string;
  profile: ProfileData;
  items: Item[];
  demo?: boolean;
  adminPreview?: boolean;
  adminEditing?: string;
  busy?: boolean;
  onSave: (i: Item) => Promise<unknown>;
  onRemove: (id: string) => Promise<unknown>;
  onProfile: (p: ProfileData) => Promise<unknown>;
  onLogout: () => void;
}
export default function Workspace({
  config: c,
  name,
  profile: p,
  items,
  demo = false,
  adminPreview = false,
  adminEditing,
  busy = false,
  onSave,
  onRemove,
  onProfile,
  onLogout,
}: WorkspaceProps) {
  const [path, navigate] = useLocation();
  const root = adminEditing
    ? "/admin/manage"
    : demo
      ? "/demo"
      : adminPreview
        ? "/preview"
        : "/app";
  const page = path.split("/")[adminEditing ? 3 : 2] || "dashboard";
  const href = (section = "dashboard") =>
    `${root}${section === "dashboard" ? "" : "/" + section}${adminEditing ? "?user=" + encodeURIComponent(adminEditing) : ""}`;
  const [edit, setEdit] = useState<Item | null>(null),
    [deleting, setDeleting] = useState<Item | null>(null),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("الكل"),
    [error, setError] = useState("");
  useEffect(() => {
    setSearch("");
    setCategory("الكل");
    setError("");
    window.scrollTo(0, 0);
  }, [page]);
  const visible = modules.filter(
    ([id]) =>
      !!adminEditing ||
      ["dashboard", "settings"].includes(id) ||
      c.enabledModules.includes(id as Config["enabledModules"][number]),
  );
  const selected = visible.find(([id]) => id === page)?.[0] ?? "dashboard";
  const section = c.sections[selected as SectionKey];
  const title =
    section?.title ??
    modules.find(([id]) => id === selected)?.[1] ??
    "الرئيسية";
  const t = totals(items, p.budget),
    days = daysUntil(p.weddingDate),
    g = items.filter((i) => i.kind === "gihaz"),
    guests = items.filter((i) => i.kind === "guests");
  const today = localDay(),
    water = items.find((i) => i.kind === "water" && i.date === today),
    cups = water?.bought ?? 0;
  async function save(i: Item) {
    setError("");
    try {
      await onSave(i);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر حفظ التغيير");
      throw e;
    }
  }
  const care = items
    .filter((i) => i.kind === "glowup" && !i.done)
    .sort((a, b) => a.date.localeCompare(b.date));
  const currentItems = items
    .filter((i) => i.kind === selected)
    .filter(
      (i) =>
        (category === "الكل" ||
          selected !== "gihaz" ||
          i.category === category) &&
        `${i.name} ${i.category}`.includes(search),
    );
  function add() {
    setEdit(
      makeItem(selected as Item["kind"], "", {
        category:
          selected === "gihaz"
            ? categories[0]
            : selected === "songs"
              ? "الزفة والدخلة"
              : selected === "guests"
                ? "أهل العروسة"
                : "",
        date:
          selected === "wedding"
            ? p.weddingDate
            : selected === "glowup"
              ? dateBefore(p.weddingDate, 30)
              : "",
      }),
    );
  }
  function exportSongs() {
    const text = items
      .filter((i) => i.kind === "songs")
      .map((i) => `${i.category}: ${i.name}`)
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "قائمة-أغاني-الفرح.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  const fieldPage = ["gihaz", "wedding", "glowup", "guests", "songs"].includes(
    selected,
  );
  return (
    <div
      dir="rtl"
      className="workspace"
      style={
        {
          "--accent": c.primaryColor,
          "--paper": c.bgColor,
        } as React.CSSProperties
      }
    >
      {(demo || adminPreview) && (
        <div className="demo-bar">
          <span>
            {adminPreview ? "معاينة الإدارة" : "مساحة تجريبية"} — التغييرات هنا
            مؤقتة ولا تؤثر على حسابات العرايس.
          </span>
          <Link href={adminPreview ? "/admin" : "/register"}>
            {adminPreview ? "العودة للإدارة" : "اعملي حسابك الحقيقي"}{" "}
            <ArrowUpLeft size={14} />
          </Link>
        </div>
      )}
      {adminEditing && (
        <div className="demo-bar">
          <span>
            تعديل بيانات العروسة: {name} — التغييرات تُحفظ في حسابها الحقيقي.
          </span>
          <Link href="/admin/brides">العودة لإدارة العرايس ←</Link>
        </div>
      )}
      <aside className="sidebar">
        <Brand name={c.brandName} />
        <div className="sidebar-label">نوّتتك، على ذوقك</div>
        <nav>
          {visible.map(([id, label]) => {
            const Icon = icons[modules.findIndex((m) => m[0] === id)];
            return (
              <Link
                href={href(id)}
                key={id}
                className={selected === id ? "active" : ""}
              >
                <Icon size={18} strokeWidth={1.5} />
                {c.sections[id as SectionKey]?.title ?? label}
                {selected === id && <span className="nav-dot" />}
              </Link>
            );
          })}
        </nav>
        {!adminEditing && (
          <Link
            className="btn outline"
            href={demo || adminPreview ? "/register" : "/payment"}
          >
            <Wallet size={17} />
            {demo || adminPreview
              ? "الاشتراك والدفع عبر InstaPay"
              : "اشتراكي ودفع InstaPay"}
          </Link>
        )}
        <div className="sidebar-bottom">
          <div className="mini-countdown">
            <Heart size={18} strokeWidth={1} />
            <p>كل يوم أقرب لحلمك</p>
            <strong>{moneyText(days)} يوم</strong>
            <small>
              {new Date(p.weddingDate + "T12:00:00").toLocaleDateString(
                "ar-EG",
                { day: "numeric", month: "long", year: "numeric" },
              )}
            </small>
          </div>
          <button onClick={onLogout}>
            <LogOut size={17} />
            {demo ? "العودة للرئيسية" : "تسجيل الخروج"}
          </button>
        </div>
      </aside>
      <main className="workspace-main">
        <div className="workspace-top">
          <span>
            رحلة التجهيز <span className="slash">/</span> {title}
          </span>
          <span className="user-chip">
            <span className="avatar">{name[0]}</span>
            {name}
            <ShieldCheck size={14} />
          </span>
        </div>
        <ErrorBox error={error} />
        <label className="section-jump">
          انتقلي للقسم
          <select
            aria-label="انتقلي للقسم"
            value={selected}
            onChange={(e) => navigate(href(e.target.value))}
          >
            {visible.map(([id, label]) => (
              <option key={id} value={id}>
                {c.sections[id as SectionKey]?.title ?? label}
              </option>
            ))}
          </select>
        </label>
        {section && (
          <section className="section-banner">
            <img src={section.image} alt={section.title} />
            <div>
              <span className="eyebrow">خطوة جديدة في رحلتك</span>
              <h1>{section.title}</h1>
              <p>{section.description}</p>
            </div>
          </section>
        )}
        {selected === "dashboard" ? (
          <>
            <PageTitle
              eyebrow="مساحتك الصغيرة.. لليوم الكبير"
              title={`أهلًا يا ${name.split(" ")[0]}، فرحتك قربت`}
              subtitle="كل خطوة بتاخديها، بتقرّبك من اليوم اللي بتحلمي بيه."
              action={
                <Link className="btn outline" href={href("gihaz")}>
                  كمّلي تجهيزاتك <ArrowUpLeft size={17} />
                </Link>
              }
            />
            <section className="countdown-banner">
              <img src="/images/hero.jpg" alt="" />
              <div>
                <span className="eyebrow">لحد ما نقول مبروك</span>
                <h2>حكايتك الحلوة.. قربت.</h2>
                <p>{c.welcome}</p>
              </div>
              <div className="day-number">
                <strong>{moneyText(days)}</strong>
                <span>يوم على الفرح</span>
                <small>{p.weddingDate}</small>
              </div>
            </section>
            <section className="section-grid" aria-label="اختاري القسم">
              {visible
                .filter(([id]) => !["dashboard", "settings"].includes(id))
                .map(([id]) => {
                  const s = c.sections[id as SectionKey];
                  return (
                    <Link className="section-card" key={id} href={href(id)}>
                      <img src={s.image} alt="" loading="lazy" />
                      <div>
                        <h2>{s.title}</h2>
                        <p>{s.description}</p>
                        <span>افتحي القسم ←</span>
                      </div>
                    </Link>
                  );
                })}
            </section>
            <div className="metric-row">
              <Metric
                label="إنجاز نوتة الجهاز"
                value={`${moneyText(t.progress)}٪`}
                note={`${g.filter((i) => i.bought === i.quantity).length} من ${g.length} بند مكتمل`}
              >
                <div className="progress">
                  <span style={{ width: `${t.progress}%` }} />
                </div>
              </Metric>
              <Metric
                label="المدفوع حتى الآن"
                value={moneyText(t.paid)}
                note="جنيه مصري • جهاز + حجوزات"
              />
              <Metric
                label="المتبقي نقدًا"
                value={moneyText(t.cash)}
                note={`من ميزانية ${moneyText(p.budget)} ج.م`}
              />
              <Metric
                label="المعازيم المؤكدين"
                value={moneyText(
                  guests
                    .filter((i) => i.confirmed)
                    .reduce((s, i) => s + i.quantity, 0),
                )}
                note={`من ${guests.reduce((s, i) => s + i.quantity, 0)} فرد في القائمة`}
              />
            </div>
            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-title">
                  <h2>
                    <Sparkles size={18} /> أقرب خطوات العناية
                  </h2>
                  <Link href={href("glowup")}>
                    كل المواعيد <ArrowUpLeft size={15} />
                  </Link>
                </div>
                {care.length ? (
                  care.slice(0, 3).map((i) => (
                    <div className="care-row" key={i.id}>
                      <button
                        className="icon-btn"
                        aria-label={`إتمام ${i.name}`}
                        disabled={busy}
                        onClick={() =>
                          void save({ ...i, done: true }).catch(() => {})
                        }
                      >
                        <Circle size={20} />
                      </button>
                      <div>
                        <strong>{i.name}</strong>
                        <small>{i.category}</small>
                      </div>
                      <time>
                        {i.date
                          ? new Date(i.date + "T12:00:00").toLocaleDateString(
                              "ar-EG",
                              { day: "numeric", month: "short" },
                            )
                          : "بدون موعد"}
                      </time>
                    </div>
                  ))
                ) : (
                  <Empty text="كل خطوات العناية مكتملة، أو لم تضيفي مواعيد بعد." />
                )}
              </section>
              <section className="panel water-panel">
                <div className="panel-title">
                  <h2>
                    <Droplets size={18} /> لحظة اهتمام بنفسك
                  </h2>
                  <span className="tag">اليوم</span>
                </div>
                <p>شرب المياه اليوم</p>
                <div className="water-cups">
                  {Array.from({ length: 12 }, (_, i) => (
                    <button
                      aria-label={`${i + 1} أكواب ماء`}
                      aria-pressed={i < cups}
                      disabled={busy}
                      className={i < cups ? "filled" : ""}
                      key={i}
                      onClick={() =>
                        void save({
                          ...(water ??
                            makeItem("water", "شرب المياه", { date: today })),
                          bought: i + 1 === cups ? 0 : i + 1,
                        }).catch(() => {})
                      }
                    >
                      <Droplets size={25} strokeWidth={1.2} />
                    </button>
                  ))}
                </div>
                <div className="water-caption">
                  <strong>{moneyText(cups * 250)} مل</strong>
                  <span>{cups} / 12 كوب</span>
                </div>
                <small>متابعة شخصية، وليست كمية موصى بها للجميع.</small>
              </section>
            </div>
            <div className="quiet-note">
              <Heart size={17} strokeWidth={1} /> مش لازم تخلّصي كل حاجة
              النهارده.. خطوة صغيرة كل يوم كفاية.
            </div>
          </>
        ) : (
          <PageTitle
            eyebrow="تفصيلة بتفصيلة"
            title="تفاصيل القسم"
            subtitle={
              selected === "gihaz"
                ? "من أول طقم حلل.. لآخر تفصيلة في بيتك الجديد."
                : selected === "budget"
                  ? "فرّقي بين المتبقي في إيدك، والمتاح بعد كل الالتزامات."
                  : "كل التفاصيل محفوظة في مساحتك الخاصة."
            }
            action={
              fieldPage ? (
                <Button onClick={add}>
                  <Plus size={17} />{" "}
                  {selected === "wedding"
                    ? "إضافة حجز"
                    : selected === "glowup"
                      ? "إضافة موعد"
                      : selected === "guests"
                        ? "إضافة معازيم"
                        : selected === "songs"
                          ? "إضافة أغنية"
                          : "إضافة صنف"}
                </Button>
              ) : undefined
            }
          />
        )}
        {fieldPage && (
          <>
            <div className="toolbar">
              <label className="search">
                <Search size={17} />
                <input
                  aria-label="البحث"
                  placeholder="ابحثي عن تفصيلة…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              {selected === "songs" && (
                <Button
                  className="outline"
                  onClick={exportSongs}
                  disabled={!currentItems.length}
                >
                  <Download size={16} /> تصدير قائمة DJ
                </Button>
              )}
              {selected === "guests" && (
                <span className="tag">
                  {moneyText(guests.reduce((s, i) => s + i.quantity, 0))} فرد •{" "}
                  {moneyText(
                    guests
                      .filter((i) => i.confirmed)
                      .reduce((s, i) => s + i.quantity, 0),
                  )}{" "}
                  مؤكد
                </span>
              )}
            </div>
            {selected === "gihaz" && (
              <>
                <div className="filters">
                  {["الكل", ...categories].map((cat) => (
                    <button
                      key={cat}
                      className={category === cat ? "active" : ""}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="small-note">
                  السعر هو سعر الوحدة × الكمية. أسعار القالب تقديرية من بياناتك
                  الأصلية، وليست أسعار السوق الحالية.
                </div>
              </>
            )}
            {!currentItems.length ? (
              <Empty />
            ) : selected === "gihaz" ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>تم</th>
                      <th>الصنف</th>
                      <th>القسم</th>
                      <th>المشترى / المطلوب</th>
                      <th>سعر الوحدة</th>
                      <th>المدفوع</th>
                      <th>تعديل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((i) => (
                      <tr
                        key={i.id}
                        className={i.bought === i.quantity ? "completed" : ""}
                      >
                        <td>
                          <button
                            className="icon-btn"
                            disabled={busy}
                            aria-label={`تبديل شراء ${i.name}`}
                            onClick={() =>
                              void save({
                                ...i,
                                bought:
                                  i.bought === i.quantity ? 0 : i.quantity,
                                done: i.bought !== i.quantity,
                              }).catch(() => {})
                            }
                          >
                            {i.bought === i.quantity ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <Circle size={20} />
                            )}
                          </button>
                        </td>
                        <td>
                          <strong>{i.name}</strong>
                          <small>
                            {[i.color, i.store].filter(Boolean).join(" • ")}
                          </small>
                        </td>
                        <td>
                          <span className="tag">{i.category}</span>
                        </td>
                        <td>
                          {i.bought} / {i.quantity}
                        </td>
                        <td>{moneyText(i.price)} ج.م</td>
                        <td>{moneyText(i.price * i.bought)} ج.م</td>
                        <td>
                          <ItemActions
                            item={i}
                            edit={setEdit}
                            remove={setDeleting}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className={
                  selected === "wedding" ? "vendor-grid" : "list-panel"
                }
              >
                {currentItems
                  .sort((a, b) =>
                    selected === "glowup" ? a.date.localeCompare(b.date) : 0,
                  )
                  .map((i) =>
                    selected === "wedding" ? (
                      <section className="panel vendor-card" key={i.id}>
                        <div className="vendor-head">
                          <div>
                            <span className="eyebrow">{i.category}</span>
                            <h2>{i.name}</h2>
                          </div>
                          <ItemActions
                            item={i}
                            edit={setEdit}
                            remove={setDeleting}
                          />
                        </div>
                        <p>
                          {i.phone && <a href={`tel:${i.phone}`}>{i.phone}</a>}{" "}
                          {i.date && `• ${i.date}`}
                        </p>
                        <div className="vendor-amounts">
                          <div>
                            <small>الإجمالي</small>
                            <strong>{moneyText(i.price)}</strong>
                          </div>
                          <div>
                            <small>المدفوع</small>
                            <strong>{moneyText(i.paid)}</strong>
                          </div>
                          <div>
                            <small>المتبقي</small>
                            <strong>{moneyText(i.price - i.paid)}</strong>
                          </div>
                        </div>
                        <div className="progress">
                          <span
                            style={{
                              width: `${i.price ? (i.paid / i.price) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </section>
                    ) : (
                      <div
                        className={`list-row ${i.done ? "completed" : ""}`}
                        key={i.id}
                      >
                        {selected === "glowup" ? (
                          <button
                            className="icon-btn"
                            aria-label={`تبديل إتمام ${i.name}`}
                            disabled={busy}
                            onClick={() =>
                              void save({ ...i, done: !i.done }).catch(() => {})
                            }
                          >
                            {i.done ? <CheckCircle2 /> : <Circle />}
                          </button>
                        ) : selected === "songs" ? (
                          <Music size={20} />
                        ) : (
                          <Users size={20} />
                        )}
                        <div className="list-name">
                          <strong>{i.name}</strong>
                          <small>
                            {i.category}
                            {i.store && ` • ${i.store}`}
                          </small>
                        </div>
                        {selected === "glowup" && (
                          <time>{i.date || "بدون موعد"}</time>
                        )}
                        {selected === "guests" && (
                          <>
                            <span>{i.quantity} أفراد</span>
                            <button
                              disabled={busy}
                              className={`tag ${i.confirmed ? "confirmed" : ""}`}
                              onClick={() =>
                                void save({
                                  ...i,
                                  confirmed: !i.confirmed,
                                }).catch(() => {})
                              }
                            >
                              {i.confirmed ? (
                                <>
                                  <Check size={13} /> مؤكد
                                </>
                              ) : (
                                "بانتظار التأكيد"
                              )}
                            </button>
                          </>
                        )}
                        <ItemActions
                          item={i}
                          edit={setEdit}
                          remove={setDeleting}
                        />
                      </div>
                    ),
                  )}
              </div>
            )}
          </>
        )}
        {selected === "budget" && (
          <>
            <div className="metric-row budget-metrics">
              <Metric
                label="الميزانية الكلية"
                value={moneyText(p.budget)}
                note="جنيه مصري"
              />
              <Metric
                label="المدفوع فعليًا"
                value={moneyText(t.paid)}
                note="المشتريات + مدفوعات الحجوزات"
              />
              <Metric
                label="المتبقي نقدًا"
                value={moneyText(t.cash)}
                note="الميزانية − المدفوع"
              />
              <Metric
                label="المتاح بعد الالتزامات"
                value={moneyText(t.available)}
                note="الميزانية − كامل المخطط"
              />
            </div>
            {t.available < 0 && (
              <div className="error">
                التزاماتك تتجاوز الميزانية بـ {moneyText(-t.available)} ج.م.
                راجعي البنود قبل إضافة التزامات جديدة.
              </div>
            )}
            <div className="dashboard-grid">
              <section className="panel">
                <h2>توزيع مدفوعاتك</h2>
                {[
                  ["الجهاز", t.gihazPaid],
                  ["حجوزات الفرح", t.vendorPaid],
                ].map(([label, value]) => (
                  <div className="budget-bar" key={String(label)}>
                    <div>
                      <span>{label}</span>
                      <strong>{moneyText(Number(value))} ج.م</strong>
                    </div>
                    <div className="progress">
                      <span
                        style={{
                          width: `${t.paid ? (Number(value) / t.paid) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="small-note">
                  التزامات إجمالية: {moneyText(t.committed)} ج.م
                  <br />
                  المتبقي للدفع للمورّدين:{" "}
                  {moneyText(
                    items
                      .filter((i) => i.kind === "wedding")
                      .reduce((s, i) => s + i.price - i.paid, 0),
                  )}{" "}
                  ج.م
                </div>
              </section>
              <section className="panel">
                <h2>وضوح أكتر.. راحة أكتر.</h2>
                <p>
                  «المتبقي نقدًا» هو اللي لسه في الميزانية بعد اللي دفعتيه.
                  «المتاح بعد الالتزامات» بيحسب كل الجهاز المطلوب والحجوزات
                  بالكامل، حتى اللي لسه ما اتدفعش.
                </p>
                <Link href={href("settings")} className="editorial-link">
                  عدّلي ميزانيتك <ArrowUpLeft size={16} />
                </Link>
              </section>
            </div>
          </>
        )}
        {selected === "diet" && <Diet profile={p} root={href("settings")} />}
        {selected === "settings" && (
          <section className="panel profile-panel">
            <h2>كل حاجة على مقاسك</h2>
            <p>
              عدّلي بياناتك، والعداد والميزانية يتحدثوا تلقائيًا. مواعيد العناية
              الموجودة تُعدّل من صفحة العناية.
            </p>
            <ProfileForm initial={p} busy={busy} onSave={onProfile} />
          </section>
        )}
        <div className="workspace-footer">
          <span>{c.brandName} — معاكِ، تفصيلة بتفصيلة.</span>
          <span dir="ltr">MADE FOR YOUR BEAUTIFUL JOURNEY</span>
        </div>
      </main>
      {edit && (
        <Modal
          title={edit.name ? "تعديل التفاصيل" : "تفصيلة جديدة"}
          onClose={() => setEdit(null)}
        >
          <ItemEditor
            item={edit}
            busy={busy}
            onSave={async (i) => {
              await save(i);
              setEdit(null);
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal title="حذف هذه التفصيلة؟" onClose={() => setDeleting(null)}>
          <p>
            سيُحذف «{deleting.name}» وتتحدث الميزانية. لا يمكن التراجع عن الحذف.
          </p>
          <ErrorBox error={error} />
          <div className="modal-actions">
            <Button
              className="danger"
              busy={busy}
              onClick={async () => {
                try {
                  await onRemove(deleting.id);
                  setDeleting(null);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "تعذّر الحذف");
                }
              }}
            >
              حذف التفصيلة
            </Button>
            <Button className="outline" onClick={() => setDeleting(null)}>
              إلغاء
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  note,
  children,
}: {
  label: string;
  value: string;
  note: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={value.startsWith("-") ? "negative" : ""}>
        {value}
      </strong>
      <small>{note}</small>
      {children}
    </div>
  );
}
function ItemActions({
  item,
  edit,
  remove,
}: {
  item: Item;
  edit: (i: Item) => void;
  remove: (i: Item) => void;
}) {
  return (
    <div className="item-actions">
      <button
        className="icon-btn"
        aria-label={`تعديل ${item.name}`}
        onClick={() => edit(item)}
      >
        <Pencil size={15} />
      </button>
      <button
        className="icon-btn delete"
        aria-label={`حذف ${item.name}`}
        onClick={() => remove(item)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
function Diet({ profile: p, root }: { profile: ProfileData; root: string }) {
  const maintenance = Math.round(
    (10 * p.weight + 6.25 * p.height - 5 * p.age - 161) * p.activity,
  );
  const bmi = p.weight / (p.height / 100) ** 2,
    targetBmi = p.targetWeight / (p.height / 100) ** 2;
  return (
    <>
      <div className="metric-row">
        <Metric label="الوزن الحالي" value={`${p.weight}`} note="كجم" />
        <Metric
          label="الوزن المستهدف"
          value={`${p.targetWeight}`}
          note="هدفك الشخصي — ليس توصية طبية"
        />
        <Metric
          label="تقدير سعرات الحفاظ على الوزن"
          value={moneyText(maintenance)}
          note="سعرة / يوم • معادلة Mifflin–St Jeor"
        />
        <Metric
          label="مؤشر كتلة الجسم"
          value={bmi.toFixed(1)}
          note="مؤشر عام وليس تشخيصًا"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <h2>صحتك أولًا.. دايمًا</h2>
          <p>
            التقدير للبالغات فقط ويتأثر بالنشاط والصحة. لا ينطبق على الحمل أو
            الرضاعة أو الحالات الطبية. لا نضع عجز سعرات تلقائيًا ولا خطة نزول وزن
            حسب موعد الفرح.
          </p>
          {targetBmi < 18.5 && (
            <div className="error">
              الوزن المستهدف أقل من النطاق المعتاد لمؤشر كتلة الجسم. استشيري
              مختصًا قبل محاولة الوصول إليه.
            </div>
          )}
          <Link href={root} className="editorial-link">
            تعديل الوزن والعمر والنشاط <ArrowUpLeft size={16} />
          </Link>
        </section>
        <section className="panel">
          <h2>أفكار لوجبات مصرية متوازنة</h2>
          <div className="meal">
            <strong>فطار بسيط</strong>
            <p>بيض أو فول، خبز بلدي وخضار.</p>
          </div>
          <div className="meal">
            <strong>غداء متوازن</strong>
            <p>فراخ أو سمك أو بقول، أرز وسلطة.</p>
          </div>
          <div className="meal">
            <strong>عشاء وسناك</strong>
            <p>زبادي أو جبنة، فاكهة ومكسرات بكميات تناسبك.</p>
          </div>
          <small>أفكار عامة؛ لا تمثل خطة بسعرات محسوبة أو حمية شخصية.</small>
        </section>
      </div>
    </>
  );
}
