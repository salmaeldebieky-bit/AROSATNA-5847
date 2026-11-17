import { Link } from "wouter";
import {
  ArrowDown,
  ArrowUpLeft,
  Check,
  ShoppingBag,
  Wallet,
  Sparkles,
  Calendar,
  Music,
  Users,
} from "lucide-react";
import { Brand, Loading, ErrorBox } from "../components/common";
import { useConfig } from "../queries/planner";

export default function Landing() {
  const query = useConfig();
  if (query.isLoading) return <Loading />;
  if (!query.data) return <ErrorBox error={query.error} />;
  const c = query.data;
  return (
    <div className="landing" dir="rtl">
      <section className="hero">
        <img
          className="hero-img"
          src="/images/hero.jpg"
          alt="عروسان يحتفلان في حديقة"
        />
        <nav className="public-nav">
          <Brand name={c.brandName} light />
          <div className="nav-links">
            <a href="#journey">رحلتك معانا</a>
            <a href="#features">كل التفاصيل</a>
            <a href="#subscription">الاشتراك</a>
            <Link href="/admin-login">لوحة الإدارة</Link>
          </div>
          <Link className="nav-login" href="/login">
            تسجيل الدخول <ArrowUpLeft size={14} />
          </Link>
        </nav>
        <div className="hero-content">
          <span className="eyebrow">من أول قائمة.. لآخر تفصيلة</span>
          <div className="little-rule" />
          <h1>
            {c.heroTitle.split("\n").map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </h1>
          <p>{c.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="btn ivory" href="/register">
              ابدئي رحلتك <ArrowUpLeft size={17} />
            </Link>
            <Link href="/demo" className="text-link">
              جرّبي نوتة عروستنا <ArrowUpLeft size={15} />
            </Link>
            <Link href="/payment" className="text-link">دفع الاشتراك عبر InstaPay ←</Link>
          </div>
          <small>
            اشتراك واحد • {c.subscriptionPrice} جنيه • لحد يوم الفرح
          </small>
        </div>
        <div className="hero-bottom">
          <span>كل حكاية جميلة.. تبدأ بتفصيلة</span>
          <a href="#journey" aria-label="اكتشفي الرحلة">
            <ArrowDown size={20} />
          </a>
          <span dir="ltr">YOUR DAY, YOUR WAY</span>
        </div>
      </section>
      <div className="promise-strip">
        <span>
          <Check size={14} /> معمولة للعروسة المصرية
        </span>
        <span>
          <Check size={14} /> بياناتك في مساحتك الخاصة
        </span>
        <span>
          <Check size={14} /> معاكِ على الموبايل والكمبيوتر
        </span>
      </div>
      <section className="story-section" id="journey">
        <div className="section-heading">
          <span className="eyebrow">رحلة تستاهل تستمتعي بيها</span>
          <h2>التجهيز مش لازم يكون دوشة</h2>
          <p>
            بين قوائم الجهاز وحجوزات الفرح.. خلي بالك مرتاح، وسيبي التفاصيل
            لنوّتتك.
          </p>
        </div>
        <div className="story-row">
          <div className="story-image">
            <img
              src="/images/details.jpg"
              alt="باقة زهور وتجهيزات عروسة"
              loading="lazy"
            />
            <span>01 / التفاصيل الصغيرة</span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">نوتة الجهاز المصرية</span>
            <h3>
              كل حاجة لبيتك الجديد،
              <br />
              ولا تفصيلة تتنسي.
            </h3>
            <p>
              من طقم الحلل لآخر فوطة. قوائم جاهزة للمطبخ، النيش والمفروشات،
              بالمطلوب والمشترى والألوان والأسعار. عدّليها على ذوقك، وعلمي على كل
              خطوة خلصت.
            </p>
            <Link href="/demo/gihaz" className="editorial-link">
              اكتشفي نوتة الجهاز <ArrowUpLeft size={17} />
            </Link>
          </div>
        </div>
        <div className="story-row reverse">
          <div className="story-image">
            <img
              src="/images/couple.jpg"
              alt="لحظة هادئة بين عروسين"
              loading="lazy"
            />
            <span>02 / يومك الكبير</span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">كل يوم أقرب لحلمك</span>
            <h3>
              فرحك على ذوقك،
              <br />
              وميزانيتك تحت السيطرة.
            </h3>
            <p>
              احجزي القاعة والميكب والفستان، تابعي المدفوع والمتبقي، وجهّزي
              المعازيم وأغاني الدخلة. كل الالتزامات في مكان واحد، عشان تركّزي على
              اللحظة.
            </p>
            <Link href="/demo/budget" className="editorial-link">
              شوفي مساحتك الخاصة <ArrowUpLeft size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">مساحة واحدة لكل اللي محتاجاه</span>
          <h2>من أول الجهاز.. ليوم الفرح</h2>
        </div>
        <div className="feature-list">
          {[
            [ShoppingBag, "نوتة الجهاز", "قوائم تفصيلية بالمطلوب والمشترى."],
            [
              Wallet,
              "الخزنة والميزانية",
              "المدفوع والالتزامات، من غير مفاجآت.",
            ],
            [Calendar, "حجوزات الفرح", "كل مواعيدك والعربون في مكان واحد."],
            [Sparkles, "العناية والـ Glow Up", "خطوات عنايتك مرتّبة قبل الفرح."],
            [Users, "ليستة المعازيم", "الأعداد والتأكيدات، بسهولة."],
            [Music, "أغاني الفرح", "من الزفة للسلو.. قائمتك جاهزة."],
          ].map(([Icon, title, desc], i) => {
            const I = Icon as typeof ShoppingBag;
            return (
              <Link href="/demo" className="feature" key={i}>
                <I size={24} strokeWidth={1} />
                <h3>{String(title)}</h3>
                <p>{String(desc)}</p>
                <ArrowUpLeft size={15} />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="subscription" id="subscription">
        <img src="/images/hero.jpg" alt="" loading="lazy" />
        <div>
          <span className="eyebrow">يوم واحد.. تفاصيل كتير.. نوتة واحدة</span>
          <h2>ابدئي حكايتك مع {c.brandName}</h2>
          <p>اشتراك مرة واحدة. كل الأقسام. ومعاكِ لحد الفرح.</p>
          <div className="price">
            {c.subscriptionPrice}
            <span>جنيه مصري</span>
          </div>
          <Link className="btn ivory" href="/register">
            اعملي حسابك الآن <ArrowUpLeft size={17} />
          </Link>
          <small>تفعيل الاشتراك يدويًا بعد مراجعة إيصال InstaPay</small>
        </div>
      </section>
      <section className="last-note">
        <span className="eyebrow">لأن الرحلة حلوة زي الوصول</span>
        <h2>خدي نفس.. وعيشي فرحتك.</h2>
        <Link href="/demo" className="editorial-link">
          جرّبي المنصة قبل الاشتراك <ArrowUpLeft size={17} />
        </Link>
      </section>
      <footer>
        <Brand name={c.brandName} />
        <p>معاكِ، تفصيلة بتفصيلة.</p>
        <a
          href={`https://wa.me/${c.supportWhatsapp}`}
          target="_blank"
          rel="noreferrer"
        >
          تواصلي معانا
        </a>
        <span>
          © {new Date().getFullYear()} {c.brandName}
        </span>
      </footer>
    </div>
  );
}
