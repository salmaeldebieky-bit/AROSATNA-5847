import { useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button, ErrorBox, Modal, Empty } from "../components/common";
import { ItemEditor } from "../components/item-editor";
import {
  makeItem,
  sectionDefaults,
  type Config,
  type Item,
  type SectionKey,
} from "../../shared/planner";

export default function AdminSection({
  section,
  config: c,
  onSave,
  busy,
}: {
  section: SectionKey;
  config: Config;
  onSave: (c: Config) => Promise<void>;
  busy: boolean;
}) {
  const [edit, setEdit] = useState<Item | null>(null),
    [remove, setRemove] = useState<Item | null>(null),
    [error, setError] = useState("");
  const s = c.sections[section];
  const hasItems = ["gihaz", "wedding", "glowup", "guests", "songs"].includes(
    section,
  );
  const templates = c.templates.filter((i) => i.kind === section);
  return (
    <>
      <section className="section-banner">
        <img src={s.image} alt={s.title} />
        <div>
          <span className="eyebrow">تعديل القسم</span>
          <h2>{s.title}</h2>
          <p>{s.description}</p>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <h2>عنوان القسم وصورته</h2>
          <p>
            هذه التعديلات تظهر لكل العرايس. البنود الافتراضية تُضاف للحسابات
            الجديدة فقط.
          </p>
          <form
            key={section}
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const f = new FormData(e.currentTarget);
              try {
                await onSave({
                  ...c,
                  sections: {
                    ...c.sections,
                    [section]: {
                      title: String(f.get("title")),
                      description: String(f.get("description")),
                      image: String(f.get("image")),
                    },
                  },
                });
              } catch (err) {
                setError(err instanceof Error ? err.message : "تعذّر الحفظ");
              }
            }}
          >
            <label>
              عنوان القسم
              <input
                aria-label="عنوان القسم"
                name="title"
                defaultValue={s.title}
                required
                maxLength={200}
              />
            </label>
            <label>
              وصف القسم
              <textarea
                aria-label="وصف القسم"
                name="description"
                defaultValue={s.description}
                maxLength={600}
              />
            </label>
            <label>
              صورة القسم
              <select
                aria-label="صورة القسم"
                name="image"
                defaultValue={s.image}
              >
                {Object.entries(sectionDefaults).map(([key, v]) => (
                  <option key={key} value={v.image}>
                    {v.title}
                  </option>
                ))}
              </select>
            </label>
            <ErrorBox error={error} />
            <Button type="submit" busy={busy}>
              حفظ محتوى القسم
            </Button>
          </form>
        </section>
        <section className="panel">
          <h2>عايزة تعدّلي نوتة عروسة بعينها؟</h2>
          <p>
            اختاري العروسة من إدارة العرايس ثم افتحي «تعديل النوتة». تعديل
            حسابها لا يغيّر بيانات باقي العرايس.
          </p>
          <Link className="btn outline" href="/admin/brides">
            اختيار عروسة ←
          </Link>
          <Link className="editorial-link" href={`/preview/${section}`}>
            معاينة صفحة العروسة ←
          </Link>
        </section>
      </div>
      {hasItems && (
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>البنود الافتراضية للقسم</h2>
              <small>
                تطبّق عند تجهيز نوتة عروسة جديدة، وليس على النوتات الحالية.
              </small>
            </div>
            <Button
              onClick={() =>
                setEdit(
                  makeItem(section as Item["kind"], "", {
                    category: section === "gihaz" ? "المطبخ" : "",
                  }),
                )
              }
            >
              <Plus size={16} />
              إضافة بند
            </Button>
          </div>
          {templates.length ? (
            templates.map((i) => (
              <div className="list-row" key={i.id}>
                <div className="list-name">
                  <strong>{i.name}</strong>
                  <small>{i.category}</small>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`تعديل ${i.name}`}
                  onClick={() => setEdit(i)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-btn delete"
                  aria-label={`حذف ${i.name}`}
                  onClick={() => setRemove(i)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <Empty text="لا توجد بنود افتراضية هنا. يمكنك إضافتها أو ترك العروسة تضيف تفاصيلها." />
          )}
        </section>
      )}
      {edit && (
        <Modal title="تعديل البند الافتراضي" onClose={() => setEdit(null)}>
          <ItemEditor
            item={edit}
            busy={busy}
            onSave={async (item) => {
              await onSave({
                ...c,
                templates: c.templates.some((t) => t.id === item.id)
                  ? c.templates.map((t) => (t.id === item.id ? item : t))
                  : [...c.templates, item],
              });
              setEdit(null);
            }}
          />
        </Modal>
      )}
      {remove && (
        <Modal title="حذف البند الافتراضي؟" onClose={() => setRemove(null)}>
          <p>لن يُحذف من حسابات العرايس الحالية.</p>
          <ErrorBox error={error} />
          <Button
            className="danger"
            busy={busy}
            onClick={async () => {
              try {
                await onSave({
                  ...c,
                  templates: c.templates.filter((i) => i.id !== remove.id),
                });
                setRemove(null);
              } catch (err) {
                setError(err instanceof Error ? err.message : "تعذّر الحذف");
              }
            }}
          >
            تأكيد الحذف
          </Button>
        </Modal>
      )}
    </>
  );
}
