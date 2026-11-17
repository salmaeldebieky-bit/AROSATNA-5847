import { useState } from "react";
import { Link } from "wouter";
import { Clock, Copy, Upload, ShieldCheck } from "lucide-react";
import { authClient } from "../lib/auth";
import { Brand, Button, ErrorBox } from "../components/common";
import { useActions } from "../queries/planner";
import type { Config } from "../../shared/planner";
export default function Payment({
  config: c,
  status,
  note,
  name,
}: {
  config: Config;
  status: string;
  note?: string;
  name: string;
}) {
  const a = useActions();
  const [image, setImage] = useState(""),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false);
  async function file(f?: File) {
    setError("");
    setImage("");
    if (!f) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
      f.size > 2 * 1024 * 1024
    ) {
      setError("اختاري صورة JPG أو PNG أو WebP بحجم أقل من 2 ميجابايت.");
      return;
    }
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(f);
  }
  const pending = status === "under_review",
    suspended = status === "suspended";
  const active = status === "active";
  return (
    <div className="gate-page" dir="rtl">
      <Brand name={c.brandName} />
      <div className="payment-steps">
        <span>١. إنشاء الحساب</span>
        <span className="active">٢. الدفع عبر InstaPay</span>
        <span>٣. مراجعة وتفعيل</span>
      </div>
      <section className="gate-card">
        <span className="eyebrow">آخر خطوة.. ونبدأ رحلتك</span>
        <h1>
          {active
            ? "اشتراكك مفعّل"
            : pending
              ? "إيصالك قيد المراجعة"
              : suspended
                ? "الحساب موقوف مؤقتًا"
                : "تفعيل اشتراكك"}
        </h1>
        <p>
          أهلًا يا {name}،{" "}
          {active
            ? "اشتراكك جاهز وكل تفاصيلك محفوظة."
            : pending
              ? "هنراجع التحويل، وحسابك هيتفعّل بعد تأكيد الإدارة."
              : suspended
                ? "تواصلي مع الإدارة لمعرفة التفاصيل."
                : "حوّلي رسوم الاشتراك عبر InstaPay، وابعتي صورة الإيصال."}
        </p>
        {active ? (
          <div className="review-state">
            <ShieldCheck size={40} />
            <h2>تم اعتماد اشتراكك</h2>
            <p>لا تحتاجي لإرسال تحويل جديد. كمّلي تنظيم فرحك من نوّتتك.</p>
            <Link className="btn" href="/app">
              افتحي نوّتتك ←
            </Link>
          </div>
        ) : pending || suspended ? (
          <div className="review-state">
            <Clock size={40} strokeWidth={1} />
            <p>
              {pending
                ? "هذه الصفحة تتحدث تلقائيًا بعد الموافقة."
                : "الحساب غير متاح حاليًا."}
            </p>
            <a
              className="btn"
              target="_blank"
              rel="noreferrer"
              href={`https://wa.me/${c.supportWhatsapp}`}
            >
              التواصل مع الدعم
            </a>
          </div>
        ) : (
          <>
            <ErrorBox error={error || a.receipt.error} />
            {status === "rejected" && (
              <div className="error">
                سبب رفض الإيصال: {note || "يرجى إعادة إرسال صورة واضحة."}
              </div>
            )}
            <div className="payment-info">
              <p>
                ١. افتحي تطبيق InstaPay وحوّلي للمستلم التالي.
                <br />
                ٢. احتفظي بصورة التحويل وارفعِيها هنا.
                <br />
                ٣. الإدارة تراجع الاستلام وتفعّل حسابك يدويًا.
              </p>
              <div>
                <span>قيمة الاشتراك</span>
                <strong>
                  {c.subscriptionPrice} <small>ج.م</small>
                </strong>
              </div>
              <hr />
              <small>حساب InstaPay</small>
              <div className="copy-row">
                <b dir="ltr">{c.instapayAddress}</b>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="نسخ عنوان InstaPay"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(c.instapayAddress);
                      setCopied(true);
                    } catch {
                      setError("تعذّر النسخ. انسخي العنوان يدويًا.");
                    }
                  }}
                >
                  {copied ? "تم النسخ" : <Copy size={18} />}
                </button>
              </div>
              <small>المستلم: {c.instapayReceiverName}</small>
            </div>
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                if (!image) {
                  setError("صورة الإيصال مطلوبة");
                  return;
                }
                const f = new FormData(e.currentTarget);
                try {
                  await a.receipt.mutateAsync({
                    sender: String(f.get("sender")),
                    reference: String(f.get("reference")),
                    image,
                  });
                } catch {}
              }}
            >
              <label>
                عنوان InstaPay أو رقم المحوّل
                <input
                  aria-label="الحساب المحول منه"
                  name="sender"
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder="رقم الموبايل أو name@instapay"
                />
              </label>
              <label>
                رقم العملية المرجعي (اختياري)
                <input
                  aria-label="رقم العملية"
                  name="reference"
                  maxLength={100}
                />
              </label>
              <label className="upload-label">
                <Upload size={23} /> اختاري صورة إيصال التحويل
                <small>JPG / PNG / WebP • حتى 2 MB</small>
                <input
                  aria-label="صورة إيصال التحويل"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => file(e.target.files?.[0])}
                />
              </label>
              {image && (
                <img
                  className="receipt-preview"
                  src={image}
                  alt="معاينة إيصال التحويل"
                />
              )}
              <Button type="submit" busy={a.receipt.isPending}>
                إرسال الإيصال للمراجعة
              </Button>
            </form>
          </>
        )}
        <div className="security-note">
          <ShieldCheck size={16} /> الإيصال خاص بكِ وبالإدارة فقط؛ لا نتحقق من
          التحويل تلقائيًا.
        </div>
        <button className="text-link" onClick={() => authClient.signOut()}>
          تسجيل الخروج
        </button>
      </section>
    </div>
  );
}
