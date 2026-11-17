import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpLeft, ShieldCheck } from "lucide-react";
import { authClient } from "../lib/auth";
import { Brand, Button, ErrorBox } from "../components/common";
export default function AuthPage({
  register = false,
  adminLogin = false,
}: {
  register?: boolean;
  adminLogin?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  const query = useQueryClient();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const body = {
        email: String(f.get("email")).trim().toLowerCase(),
        password: String(f.get("password")),
      };
      const r = register
        ? await authClient.signUp.email({
            ...body,
            name: String(f.get("name")).trim(),
          })
        : await authClient.signIn.email(body);
      if (r.error)
        setError(
          "البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكدي من اللغة وحالة الحروف.",
        );
      else {
        query.clear();
        navigate(adminLogin ? "/admin" : "/app");
      }
    } catch {
      setError("تعذّر الاتصال. حاولي مرة تانية.");
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    setError("");
    try {
      const r = await authClient.managedAuth.signIn({ provider: "google" });
      if (r.error) setError(r.error.message ?? "تعذّر تسجيل الدخول");
      else {
        query.clear();
        navigate("/app");
      }
    } catch {
      setError("تعذّر إكمال تسجيل الدخول عبر Google");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-photo">
        <img src="/images/couple.jpg" alt="عروسان في حديقة" />
        <Brand light />
        <div>
          <span className="eyebrow">مكان صغير.. لفرحة كبيرة</span>
          <h2>
            رحلة تجهيز أهدى.
            <br />
            وفرحة أكبر.
          </h2>
          <p>كل التفاصيل اللي بتفكّري فيها، في نوتة واحدة.</p>
        </div>
      </div>
      <main className="auth-form">
        <Link href="/" className="back-link">
          العودة للرئيسية <ArrowUpLeft size={16} />
        </Link>
        <div>
          <span className="eyebrow">أهلًا بيكِ في عروستنا</span>
          <h1>
            {adminLogin
              ? "دخول لوحة الإدارة"
              : register
                ? "حكايتك تبدأ من هنا"
                : "نوّرتي نوّتتك"}
          </h1>
          {adminLogin && (
            <div className="success">
              الحساب الإداري: <b dir="ltr">salmaeldebieky@gmail.com</b>
              <p>استخدمي كلمة المرور الجديدة التي أدخلتيها في النموذج الآمن.</p>
            </div>
          )}
          <p>
            {register
              ? "اعملي حسابك، وخلي كل تفاصيل فرحك معاكِ."
              : "ادخلي مساحتك وكمّلي من آخر تفصيلة."}
          </p>
          <Button className="outline google" busy={busy} onClick={google}>
            <b dir="ltr">G</b> المتابعة باستخدام Google
          </Button>
          <div className="divider">
            <span>أو بالبريد الإلكتروني</span>
          </div>
          <ErrorBox error={error} />
          <form onSubmit={submit} className="form-stack">
            {register && (
              <label>
                اسم العروسة
                <input
                  aria-label="الاسم"
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="اسمك الجميل"
                />
              </label>
            )}
            <label>
              البريد الإلكتروني
              <input
                aria-label="البريد الإلكتروني"
                type="email"
                name="email"
                required
                autoComplete="email"
                dir="ltr"
                placeholder="name@example.com"
                defaultValue={adminLogin ? "salmaeldebieky@gmail.com" : ""}
              />
            </label>
            <label>
              كلمة المرور
              <input
                aria-label="كلمة المرور"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={register ? 12 : 1}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={register ? "12 حرفًا على الأقل" : "كلمة المرور"}
              />
            </label>
            {register && (
              <small>استخدمي كلمة مرور طويلة وفريدة لحماية حسابك.</small>
            )}
            <button
              className="text-link"
              type="button"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            </button>
            <Button busy={busy} type="submit">
              {register ? "إنشاء الحساب" : "تسجيل الدخول"}{" "}
              <ArrowUpLeft size={17} />
            </Button>
          </form>
          <p className="auth-switch">
            {register ? "عندك حساب بالفعل؟" : "أول مرة هنا؟"}{" "}
            <Link href={register ? "/login" : "/register"}>
              {register ? "تسجيل الدخول" : "ابدئي رحلتك"}
            </Link>
          </p>
          <div className="security-note">
            {!adminLogin && (
              <Link className="editorial-link" href="/admin-login">
                دخول لوحة الإدارة ←
              </Link>
            )}
            <ShieldCheck size={17} /> بياناتك خاصة، وكلمة مرورك محفوظة بتشفير
            آمن.
          </div>
        </div>
      </main>
    </div>
  );
}
