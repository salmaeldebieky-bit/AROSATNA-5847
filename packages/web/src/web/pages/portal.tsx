import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { authClient } from "../lib/auth";
import {
  useActions,
  useConfig,
  useItems,
  useMe,
  useBride,
} from "../queries/planner";
import { Brand, ErrorBox, Loading } from "../components/common";
import { ProfileForm, type ProfileData } from "../components/profile-form";
import {
  seedItems,
  makeItem,
  type Config,
  type Item,
} from "../../shared/planner";
import Workspace from "./workspace";
import Payment from "./payment";
import Admin from "./admin";

export function ProtectedPortal({
  admin = false,
  preview = false,
}: {
  admin?: boolean;
  preview?: boolean;
}) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return <Loading />;
  if (!session) return <Redirect to={admin ? "/admin-login" : "/login"} />;
  return <UserPortal admin={admin} preview={preview} />;
}
function UserPortal({ admin, preview }: { admin: boolean; preview: boolean }) {
  const me = useMe(),
    cfg = useConfig(),
    a = useActions();
  if (me.isLoading || cfg.isLoading) return <Loading />;
  if (!me.data || !cfg.data) return <ErrorBox error={me.error || cfg.error} />;
  const { profile: p, user, receipts } = me.data,
    c = cfg.data;
  if (p.role === "admin") {
    if (window.location.pathname.startsWith("/admin/manage"))
      return <ManagedBride config={c} />;
    if (preview) return <Demo config={c} adminPreview />;
    if (!admin) return <Redirect to="/admin" />;
    return <Admin config={c} />;
  }
  if (admin || preview) return <Redirect to="/app" />;
  if (p.status !== "active" && window.location.pathname !== "/payment")
    return <Redirect to="/payment" />;
  if (p.status !== "active" || window.location.pathname === "/payment")
    return (
      <Payment
        config={c}
        name={user.name}
        status={p.status}
        note={
          [...receipts].reverse().find((r) => r.status === "rejected")?.note
        }
      />
    );
  if (!p.onboarded)
    return (
      <div className="gate-page" dir="rtl">
        <Brand name={c.brandName} />
        <section className="gate-card">
          <span className="eyebrow">مبروك التفعيل</span>
          <h1>نجهّز نوّتتك يا {user.name.split(" ")[0]}؟</h1>
          <p>بيانات بسيطة عشان نرتّب ميزانيتك ومواعيدك.</p>
          <ProfileForm
            initial={p}
            onSave={(v) => a.onboard.mutateAsync(v)}
            busy={a.onboard.isPending}
            onboard
          />
        </section>
      </div>
    );
  return <RealWorkspace config={c} name={user.name} profile={p} />;
}
function ManagedBride({ config }: { config: Config }) {
  const id = new URLSearchParams(window.location.search).get("user") ?? "";
  const q = useBride(id),
    a = useActions();
  if (!id) return <ErrorBox error="اختاري العروسة من صفحة إدارة العرايس." />;
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorBox error={q.error} />;
  return (
    <Workspace
      config={config}
      name={q.data.user.name}
      profile={q.data.profile}
      items={q.data.items}
      adminEditing={id}
      busy={
        a.brideSave.isPending ||
        a.brideRemove.isPending ||
        a.brideProfile.isPending
      }
      onSave={(item) => a.brideSave.mutateAsync({ userId: id, item })}
      onRemove={(entryId) =>
        a.brideRemove.mutateAsync({ userId: id, id: entryId })
      }
      onProfile={(profile) =>
        a.brideProfile.mutateAsync({ userId: id, profile })
      }
      onLogout={() => {
        window.location.href = "/admin/brides";
      }}
    />
  );
}
function RealWorkspace({
  config,
  name,
  profile,
}: {
  config: Config;
  name: string;
  profile: ProfileData;
}) {
  const q = useItems(),
    a = useActions();
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorBox error={q.error} />;
  return (
    <Workspace
      config={config}
      name={name}
      profile={profile}
      items={q.data}
      busy={a.save.isPending || a.remove.isPending || a.profile.isPending}
      onSave={(i) => a.save.mutateAsync(i)}
      onRemove={(id) => a.remove.mutateAsync({ id })}
      onProfile={(p) => a.profile.mutateAsync(p)}
      onLogout={() => {
        void authClient.signOut();
      }}
    />
  );
}
export function DemoPage() {
  const c = useConfig();
  if (c.isLoading) return <Loading />;
  if (!c.data) return <ErrorBox error={c.error} />;
  return <Demo config={c.data} />;
}
function Demo({
  config,
  adminPreview = false,
}: {
  config: Config;
  adminPreview?: boolean;
}) {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<ProfileData>({
    weddingDate: "2027-05-01",
    budget: 250000,
    weight: 68,
    targetWeight: 58,
    height: 165,
    age: 25,
    activity: 1.375,
  });
  const [items, setItems] = useState<Item[]>(() => [
    ...seedItems(config, "2027-05-01").map((i, index) =>
      i.kind === "gihaz" && [0, 1, 3].includes(index)
        ? { ...i, bought: i.quantity, done: true }
        : i,
    ),
    makeItem("wedding", "قاعة اللؤلؤة", {
      category: "قاعة الفرح",
      price: 45000,
      paid: 15000,
      date: "2027-05-01",
      phone: "01001234567",
    }),
    makeItem("wedding", "نورهان ميكب", {
      category: "ميكب أرتيست",
      price: 8500,
      paid: 3000,
      date: "2027-05-01",
    }),
    makeItem("guests", "عائلة خالو أحمد", {
      category: "أهل العروسة",
      quantity: 5,
      confirmed: true,
    }),
    makeItem("guests", "أصدقاء الجامعة", {
      category: "الأصدقاء",
      quantity: 12,
    }),
    makeItem("songs", "طلي بالأبيض — ماجدة الرومي", {
      category: "الزفة والدخلة",
    }),
  ]);
  return (
    <Workspace
      config={config}
      name="نور الهدى"
      profile={profile}
      items={items}
      demo={!adminPreview}
      adminPreview={adminPreview}
      onSave={async (i) => {
        setItems((old) =>
          old.some((x) => x.id === i.id)
            ? old.map((x) => (x.id === i.id ? i : x))
            : [...old, i],
        );
      }}
      onRemove={async (id) => {
        setItems((old) => old.filter((x) => x.id !== id));
      }}
      onProfile={async (p) => {
        setProfile(p);
      }}
      onLogout={() => navigate(adminPreview ? "/admin" : "/")}
    />
  );
}
