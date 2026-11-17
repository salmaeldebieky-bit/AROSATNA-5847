import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Wallet,
  Users,
  ShoppingBag,
  Palette,
  Settings,
  Eye,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import {
  Brand,
  Button,
  Empty,
  ErrorBox,
  Loading,
  Modal,
  PageTitle,
} from "../components/common";
import { ItemEditor } from "../components/item-editor";
import { useActions, useAdmin, useReceipt } from "../queries/planner";
import { authClient } from "../lib/auth";
import AdminSection from "./admin-section";
import {
  makeItem,
  modules,
  moneyText,
  type Config,
  type Item,
  type SectionKey,
} from "../../shared/planner";
const nav = [
  ["dashboard", "نظرة عامة", LayoutDashboard],
  ["payments", "مراجعة InstaPay", Wallet],
  ["brides", "إدارة العرايس", Users],
  ["templates", "القوالب الافتراضية", ShoppingBag],
  ["customizer", "تخصيص الواجهة", Palette],
  ["settings", "الدفع والحساب", Settings],
] as const;
export default function Admin({ config: c }: { config: Config }) {
  const [path, navigate] = useLocation();
  const page = path.split("/")[2] || "dashboard";
  const q = useAdmin(),
    a = useActions();
  const [img, setImg] = useState(""),
    [review, setReview] = useState<{ id: string; approve: boolean } | null>(
      null,
    ),
    [edit, setEdit] = useState<Item | null>(null),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false),
    [deleteTemplate, setDeleteTemplate] = useState<Item | null>(null);
  const busy = a.review.isPending || a.status.isPending || a.config.isPending;
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorBox error={q.error} />;
  const { brides, payments } = q.data;
  const pending = payments.filter((p) => p.status === "under_review");
  const revenue = payments
    .filter((p) => p.status === "approved")
    .reduce((s, p) => s + p.amount, 0);
  async function updateConfig(next: Config) {
    setError("");
    setSaved(false);
    try {
      await a.config.mutateAsync(next);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر الحفظ");
      throw e;
    }
  }
  return (
    <div className="workspace admin-workspace" dir="rtl">
      <aside className="sidebar">
        <Brand name={c.brandName} />
        <div className="sidebar-label">
          <ShieldCheck size={15} /> لوحة إدارة سلمى
        </div>
        <Link className="btn outline" href="/preview">
          <Eye size={16} /> معاينة واجهة العروسة
        </Link>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <Link
              href={id === "dashboard" ? "/admin" : `/admin/${id}`}
              className={page === id ? "active" : ""}
              key={id}
            >
              <Icon size={18} />
              {label}
              {id === "payments" && pending.length > 0 && (
                <span className="tag">{pending.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-label">تعديل كل قسم</div>
        <nav>
          {Object.entries(c.sections).map(([id, s]) => (
            <Link
              key={id}
              href={`/admin/section-${id}`}
              className={page === `section-${id}` ? "active" : ""}
            >
              <Pencil size={16} />
              {s.title}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => authClient.signOut()}>
            <LogOut size={17} /> تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="workspace-main">
        <label className="section-jump">
          افتحي صفحة الإدارة
          <select
            aria-label="افتحي صفحة الإدارة"
            value={page}
            onChange={(e) =>
              navigate(
                e.target.value === "dashboard"
                  ? "/admin"
                  : `/admin/${e.target.value}`,
              )
            }
          >
            {nav.map(([id, label]) => (
              <option value={id} key={id}>
                {label}
              </option>
            ))}
            {Object.entries(c.sections).map(([id, s]) => (
              <option value={`section-${id}`} key={id}>
                تعديل {s.title}
              </option>
            ))}
          </select>
        </label>
        <div className="workspace-top">
          <span>إدارة المنصة / {nav.find((n) => n[0] === page)?.[1]}</span>
          <span className="user-chip">
            <ShieldCheck size={17} /> صلاحيات الإدارة
          </span>
        </div>
        <PageTitle
          eyebrow="كل التفاصيل تحت عينك"
          title={
            page.startsWith("section-")
              ? c.sections[page.slice(8) as SectionKey]?.title
              : (nav.find((n) => n[0] === page)?.[1] ?? "نظرة عامة")
          }
          subtitle="بيانات الحسابات والصلاحيات محفوظة على الخادم؛ كلمات المرور لا تُعرض لأحد."
        />
        <ErrorBox error={error || a.review.error || a.status.error} />
        {saved && <output className="success">تم حفظ التعديلات بنجاح.</output>}
        {page === "dashboard" && (
          <>
            <div className="quick-actions">
              <Link className="btn" href="/admin/payments">
                مراجعة إيصالات InstaPay ←
              </Link>
              <Link className="btn outline" href="/admin/settings">
                تعديل حساب الدفع وسعر الاشتراك
              </Link>
              <Link className="btn outline" href="/admin/brides">
                تعديل نوتة عروسة
              </Link>
            </div>
            <div className="metric-row">
              {[
                ["اشتراكات معتمدة", moneyText(revenue) + " ج.م"],
                ["طلبات المراجعة", pending.length],
                [
                  "عرايس مفعّلات",
                  brides.filter((b) => b.status === "active").length,
                ],
                ["سعر الاشتراك", c.subscriptionPrice + " ج.م"],
              ].map(([label, value]) => (
                <div className="metric" key={String(label)}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <section className="panel">
              <h2>طلبات محتاجة مراجعتك</h2>
              <p>
                {pending.length
                  ? `عندك ${pending.length} إيصال بانتظار التأكيد اليدوي من تطبيق البنك أو InstaPay.`
                  : "مفيش طلبات جديدة حاليًا. الطلبات هتظهر هنا بعد إرسال العروسة إيصالها."}
              </p>
              <Link className="editorial-link" href="/admin/payments">
                فتح مراجعة التحويلات ←
              </Link>
              <small>
                الإيرادات تمثل إيصالات الاشتراك المعتمدة، وليست الأرباح الصافية.
              </small>
            </section>
            <section className="section-grid" aria-label="تعديل الأقسام">
              {Object.entries(c.sections).map(([id, s]) => (
                <Link
                  className="section-card"
                  href={`/admin/section-${id}`}
                  key={id}
                >
                  <img src={s.image} alt="" loading="lazy" />
                  <div>
                    <h2>{s.title}</h2>
                    <p>{s.description}</p>
                    <span>تعديل القسم ←</span>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
        {page === "payments" &&
          (payments.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>العروسة</th>
                    <th>التحويل</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>الإيصال</th>
                    <th>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const bride = brides.find((b) => b.id === p.userId);
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{bride?.name}</strong>
                          <small>{bride?.email}</small>
                        </td>
                        <td>
                          <span dir="ltr">{p.sender}</span>
                          <small>{p.reference || "بدون مرجع"}</small>
                        </td>
                        <td>{p.amount} ج.م</td>
                        <td>
                          <span className="tag">
                            {p.status === "approved"
                              ? "معتمد"
                              : p.status === "rejected"
                                ? "مرفوض"
                                : "قيد المراجعة"}
                          </span>
                          {p.note && <small>{p.note}</small>}
                        </td>
                        <td>
                          <button
                            className="editorial-link"
                            onClick={() => setImg(p.id)}
                          >
                            <Eye size={15} /> عرض
                          </button>
                        </td>
                        <td>
                          {p.status === "under_review" && (
                            <div className="item-actions">
                              <Button
                                disabled={busy}
                                onClick={() =>
                                  setReview({ id: p.id, approve: true })
                                }
                              >
                                اعتماد
                              </Button>
                              <Button
                                className="outline"
                                disabled={busy}
                                onClick={() =>
                                  setReview({ id: p.id, approve: false })
                                }
                              >
                                رفض
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="لم تصل إيصالات بعد." />
          ))}
        {page === "brides" &&
          (brides.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>العروسة</th>
                    <th>تاريخ الفرح</th>
                    <th>الحالة</th>
                    <th>التحكم</th>
                  </tr>
                </thead>
                <tbody>
                  {brides.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.name}</strong>
                        <small>{b.email}</small>
                      </td>
                      <td>{b.weddingDate}</td>
                      <td>
                        <span className="tag">
                          {
                            {
                              active: "مفعّل",
                              pending: "بانتظار الدفع",
                              under_review: "قيد المراجعة",
                              rejected: "إيصال مرفوض",
                              suspended: "موقوف",
                            }[b.status]
                          }
                        </span>
                      </td>
                      <td>
                        <Link
                          className="btn outline"
                          href={`/admin/manage?user=${encodeURIComponent(b.id)}`}
                        >
                          تعديل النوتة
                        </Link>
                        {["active", "suspended"].includes(b.status) && (
                          <Button
                            className="outline"
                            busy={a.status.isPending}
                            onClick={() =>
                              a.status.mutate({
                                id: b.id,
                                suspend: b.status === "active",
                              })
                            }
                          >
                            {b.status === "active"
                              ? "إيقاف الحساب"
                              : "إعادة التنشيط"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="الحسابات الجديدة هتظهر هنا بعد التسجيل." />
          ))}
        {page === "templates" && (
          <>
            <div className="toolbar">
              <p>التعديلات تطبّق على العرايس الجدد عند التهيئة فقط.</p>
              <div className="item-actions">
                <Button
                  onClick={() =>
                    setEdit(makeItem("gihaz", "", { category: "المطبخ" }))
                  }
                >
                  <Plus size={15} /> صنف جهاز
                </Button>
                <Button
                  className="outline"
                  onClick={() =>
                    setEdit(makeItem("glowup", "", { date: "2027-04-01" }))
                  }
                >
                  <Plus size={15} /> عناية
                </Button>
              </div>
            </div>
            <div className="list-panel">
              {c.templates.map((i) => (
                <div className="list-row" key={i.id}>
                  <div className="list-name">
                    <strong>{i.name}</strong>
                    <small>
                      {i.category} •{" "}
                      {i.kind === "gihaz"
                        ? `${i.quantity} × ${moneyText(i.price)} ج.م`
                        : `${i.offset} يوم قبل الفرح`}
                    </small>
                  </div>
                  <button
                    className="icon-btn"
                    aria-label={`تعديل قالب ${i.name}`}
                    onClick={() => setEdit(i)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn delete"
                    aria-label={`حذف قالب ${i.name}`}
                    onClick={() => setDeleteTemplate(i)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {page.startsWith("section-") &&
          c.sections[page.slice(8) as SectionKey] && (
            <AdminSection
              key={page}
              section={page.slice(8) as SectionKey}
              config={c}
              onSave={updateConfig}
              busy={a.config.isPending}
            />
          )}
        {page === "customizer" && (
          <section className="panel profile-panel">
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void updateConfig({
                  ...c,
                  brandName: String(f.get("brandName")),
                  heroTitle: String(f.get("heroTitle")),
                  heroSubtitle: String(f.get("heroSubtitle")),
                  welcome: String(f.get("welcome")),
                  primaryColor: String(f.get("primaryColor")),
                  bgColor: String(f.get("bgColor")),
                  enabledModules: c.enabledModules
                    .filter(() => false)
                    .concat(
                      f.getAll("enabledModules") as Config["enabledModules"],
                    ),
                }).catch(() => {});
              }}
            >
              <label>
                اسم المنصة
                <input
                  aria-label="اسم المنصة"
                  name="brandName"
                  defaultValue={c.brandName}
                  required
                />
              </label>
              <label>
                عنوان الرئيسية
                <textarea
                  aria-label="عنوان الرئيسية"
                  name="heroTitle"
                  defaultValue={c.heroTitle}
                  required
                />
              </label>
              <label>
                وصف الرئيسية
                <textarea
                  aria-label="وصف الرئيسية"
                  name="heroSubtitle"
                  defaultValue={c.heroSubtitle}
                />
              </label>
              <label>
                رسالة الترحيب
                <input
                  aria-label="رسالة الترحيب"
                  name="welcome"
                  defaultValue={c.welcome}
                />
              </label>
              <div className="form-grid">
                <label>
                  لون التمييز
                  <input
                    aria-label="لون التمييز"
                    type="color"
                    name="primaryColor"
                    defaultValue={c.primaryColor}
                  />
                </label>
                <label>
                  لون الخلفية
                  <input
                    aria-label="لون الخلفية"
                    type="color"
                    name="bgColor"
                    defaultValue={c.bgColor}
                  />
                </label>
              </div>
              <h2>إظهار الأقسام</h2>
              <div className="form-grid">
                {modules
                  .filter(([id]) => !["dashboard", "settings"].includes(id))
                  .map(([id, label]) => (
                    <label className="checkbox-label" key={id}>
                      <input
                        aria-label={label}
                        type="checkbox"
                        name="enabledModules"
                        value={id}
                        defaultChecked={c.enabledModules.includes(
                          id as Config["enabledModules"][number],
                        )}
                      />
                      {label}
                    </label>
                  ))}
              </div>
              <Button type="submit" busy={a.config.isPending}>
                حفظ ونشر التعديلات
              </Button>
            </form>
          </section>
        )}
        {page === "settings" && (
          <div className="dashboard-grid">
            <section className="panel">
              <h2>إعدادات InstaPay</h2>
              <form
                className="form-stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void updateConfig({
                    ...c,
                    subscriptionPrice: Number(f.get("subscriptionPrice")),
                    instapayAddress: String(f.get("instapayAddress")),
                    instapayReceiverName: String(f.get("instapayReceiverName")),
                    supportWhatsapp: String(f.get("supportWhatsapp")),
                  }).catch(() => {});
                }}
              >
                <label>
                  رسوم الاشتراك (ج.م)
                  <input
                    aria-label="رسوم الاشتراك"
                    type="number"
                    name="subscriptionPrice"
                    min="0"
                    defaultValue={c.subscriptionPrice}
                    required
                  />
                </label>
                <label>
                  عنوان InstaPay
                  <input
                    aria-label="عنوان InstaPay"
                    name="instapayAddress"
                    dir="ltr"
                    defaultValue={c.instapayAddress}
                    required
                  />
                </label>
                <label>
                  اسم المستلم
                  <input
                    aria-label="اسم المستلم"
                    name="instapayReceiverName"
                    defaultValue={c.instapayReceiverName}
                    required
                  />
                </label>
                <label>
                  واتساب الدعم بالكود الدولي
                  <input
                    aria-label="رقم الدعم"
                    name="supportWhatsapp"
                    dir="ltr"
                    pattern="[0-9]{8,15}"
                    defaultValue={c.supportWhatsapp}
                    required
                  />
                </label>
                <Button type="submit" busy={a.config.isPending}>
                  حفظ إعدادات الدفع
                </Button>
              </form>
            </section>
            <PasswordChange />
          </div>
        )}
      </main>
      {img && <ReceiptModal id={img} close={() => setImg("")} />}
      {review && (
        <Modal
          title={review.approve ? "تأكيد اعتماد التحويل" : "رفض الإيصال"}
          onClose={() => setReview(null)}
        >
          <p>
            {review.approve
              ? "تأكدي من استلام المبلغ فعليًا في حساب InstaPay قبل تفعيل الاشتراك."
              : "اكتبي سببًا واضحًا حتى تتمكن العروسة من إعادة الإرسال."}
          </p>
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              try {
                await a.review.mutateAsync({
                  ...review,
                  note: String(f.get("note")),
                });
                setReview(null);
              } catch {}
            }}
          >
            <label>
              {review.approve ? "ملاحظة (اختيارية)" : "سبب الرفض"}
              <textarea
                aria-label="ملاحظة المراجعة"
                name="note"
                required={!review.approve}
                maxLength={300}
              />
            </label>
            <ErrorBox error={a.review.error} />
            <Button type="submit" busy={a.review.isPending}>
              {review.approve ? "تأكيد الاستلام والتفعيل" : "رفض الإيصال"}
            </Button>
          </form>
        </Modal>
      )}
      {edit && (
        <Modal title="تعديل القالب" onClose={() => setEdit(null)}>
          <ItemEditor
            item={edit}
            busy={a.config.isPending}
            onSave={async (i) => {
              await updateConfig({
                ...c,
                templates: c.templates.some((t) => t.id === i.id)
                  ? c.templates.map((t) => (t.id === i.id ? i : t))
                  : [...c.templates, i],
              });
              setEdit(null);
            }}
          />
        </Modal>
      )}
      {deleteTemplate && (
        <Modal title="حذف القالب؟" onClose={() => setDeleteTemplate(null)}>
          <p>لن يظهر «{deleteTemplate.name}» في قوالب العرايس الجدد.</p>
          <Button
            busy={a.config.isPending}
            className="danger"
            onClick={async () => {
              try {
                await updateConfig({
                  ...c,
                  templates: c.templates.filter(
                    (i) => i.id !== deleteTemplate.id,
                  ),
                });
                setDeleteTemplate(null);
              } catch {}
            }}
          >
            حذف القالب
          </Button>
        </Modal>
      )}
    </div>
  );
}
function ReceiptModal({ id, close }: { id: string; close: () => void }) {
  const q = useReceipt(id);
  return (
    <Modal title="إيصال التحويل" onClose={close}>
      {q.isLoading ? (
        <Loading />
      ) : q.data ? (
        <img
          className="receipt-full"
          src={q.data.image}
          alt="إيصال التحويل الخاص بالعروسة"
        />
      ) : (
        <ErrorBox error={q.error} />
      )}
    </Modal>
  );
}
function PasswordChange() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  return (
    <section className="panel">
      <h2>تغيير كلمة المرور</h2>
      <p>كلمة المرور القديمة مطلوبة. تنتهي الجلسات الأخرى بعد التغيير.</p>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          setSaved(false);
          try {
            const r = await authClient.changePassword({
              currentPassword: String(f.get("current")),
              newPassword: String(f.get("next")),
              revokeOtherSessions: true,
            });
            if (r.error) setError(r.error.message ?? "تعذّر التغيير");
            else setSaved(true);
          } catch {
            setError("تعذّر الاتصال");
          } finally {
            setBusy(false);
          }
        }}
      >
        <ErrorBox error={error} />
        {saved && <div className="success">تم تغيير كلمة المرور.</div>}
        <label>
          كلمة المرور الحالية
          <input
            aria-label="كلمة المرور الحالية"
            type="password"
            name="current"
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          كلمة المرور الجديدة
          <input
            aria-label="كلمة المرور الجديدة"
            type="password"
            name="next"
            minLength={12}
            autoComplete="new-password"
            required
          />
        </label>
        <Button busy={busy}>تغيير كلمة المرور</Button>
      </form>
    </section>
  );
}
