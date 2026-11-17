import { useState } from "react";
import { z } from "zod";
import { profileSchema } from "../../shared/planner";
import { Button, ErrorBox } from "./common";
export type ProfileData = z.infer<typeof profileSchema>;
export function ProfileForm({
  initial,
  onSave,
  busy = false,
  onboard = false,
}: {
  initial: ProfileData;
  onSave: (v: ProfileData) => Promise<unknown>;
  busy?: boolean;
  onboard?: boolean;
}) {
  const [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  return (
    <form
      className="form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setError("");
        setSaved(false);
        try {
          const input = profileSchema.parse({
            weddingDate: f.get("weddingDate"),
            budget: Number(f.get("budget")),
            weight: Number(f.get("weight")),
            targetWeight: Number(f.get("targetWeight")),
            height: Number(f.get("height")),
            age: Number(f.get("age")),
            activity: Number(f.get("activity")),
          });
          if (
            onboard &&
            input.weddingDate < new Date().toLocaleDateString("en-CA")
          )
            throw new Error("اختاري تاريخ فرح قادم");
          await onSave(input);
          setSaved(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "تعذّر الحفظ");
        }
      }}
    >
      <ErrorBox error={error} />
      {saved && (
        <output className="success">
          تم حفظ بياناتك بنجاح.
        </output>
      )}
      <div className="form-grid">
        <label>
          تاريخ الفرح
          <input aria-label="تاريخ الفرح"
            name="weddingDate"
            type="date"
            defaultValue={initial.weddingDate}
            required
          />
        </label>
        <label>
          الميزانية الكلية (ج.م)
          <input aria-label="الميزانية"
            name="budget"
            type="number"
            min="0"
            max="100000000"
            defaultValue={initial.budget}
            required
          />
        </label>
        <label>
          الوزن الحالي (كجم)
          <input aria-label="الوزن الحالي"
            name="weight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            defaultValue={initial.weight}
            required
          />
        </label>
        <label>
          الوزن المستهدف (كجم)
          <input aria-label="الوزن المستهدف"
            name="targetWeight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            defaultValue={initial.targetWeight}
            required
          />
        </label>
        <label>
          الطول (سم)
          <input aria-label="الطول"
            name="height"
            type="number"
            min="120"
            max="230"
            defaultValue={initial.height}
            required
          />
        </label>
        <label>
          العمر
          <input aria-label="العمر"
            name="age"
            type="number"
            min="18"
            max="90"
            defaultValue={initial.age}
            required
          />
        </label>
        <label className="full">
          مستوى النشاط
          <select aria-label="النشاط" name="activity" defaultValue={initial.activity}>
            <option value="1.2">قليل — أغلب اليوم جلوس</option>
            <option value="1.375">خفيف — حركة أو تمرين 1–3 أيام</option>
            <option value="1.55">متوسط — تمرين 3–5 أيام</option>
            <option value="1.725">مرتفع — تمرين معظم الأيام</option>
          </select>
        </label>
      </div>
      <small>
        بيانات الجسم اختيارية الاستخدام؛ حساب السعرات تقديري للبالغات وليس نظامًا
        طبيًا.
      </small>
      <Button type="submit" busy={busy}>
        {onboard ? "ابدئي رحلة التجهيز" : "حفظ التعديلات"}
      </Button>
    </form>
  );
}
