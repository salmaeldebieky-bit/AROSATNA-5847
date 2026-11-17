import { useState } from "react";
import { categories, itemSchema, type Item } from "../../shared/planner";
import { Button, ErrorBox } from "./common";
export function ItemEditor({
  item,
  onSave,
  busy = false,
}: {
  item: Item;
  onSave: (i: Item) => Promise<unknown>;
  busy?: boolean;
}) {
  const [error, setError] = useState("");
  const k = item.kind;
  return (
    <form
      className="form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const f = new FormData(e.currentTarget);
        const v = { ...item };
        for (const [key, value] of f.entries())
          (v as unknown as Record<string, unknown>)[key] = [
            "quantity",
            "bought",
            "price",
            "paid",
            "offset",
          ].includes(key)
            ? Number(value)
            : String(value);
        try {
          const parsed = itemSchema.parse(v);
          await onSave({
            ...parsed,
            done:
              k === "gihaz" ? parsed.bought === parsed.quantity : parsed.done,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "تعذّر الحفظ");
        }
      }}
    >
      <ErrorBox error={error} />
      <label>
        {k === "songs"
          ? "اسم الأغنية والفنان"
          : k === "guests"
            ? "اسم الشخص / العائلة"
            : k === "wedding"
              ? "اسم المكان / مقدم الخدمة"
              : k === "glowup"
                ? "العناية / الموعد"
                : "اسم الصنف"}
        <input aria-label="الاسم" name="name" required maxLength={200} defaultValue={item.name} />
      </label>
      <div className="form-grid">
        {k === "gihaz" && (
          <>
            <label>
              القسم
              <select aria-label="الفئة"
                name="category"
                defaultValue={item.category || categories[0]}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              سعر الوحدة (ج.م)
              <input aria-label="السعر"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={item.price}
              />
            </label>
            <label>
              الكمية المطلوبة
              <input aria-label="الكمية المطلوبة"
                name="quantity"
                type="number"
                min="1"
                max="10000"
                required
                defaultValue={item.quantity}
              />
            </label>
            <label>
              الكمية المشتراة
              <input aria-label="الكمية المشتراة"
                name="bought"
                type="number"
                min="0"
                max="10000"
                required
                defaultValue={item.bought}
              />
            </label>
            <label>
              اللون
              <input aria-label="اللون" name="color" defaultValue={item.color} />
            </label>
            <label>
              المحل
              <input aria-label="المحل أو العيادة" name="store" defaultValue={item.store} />
            </label>
          </>
        )}
        {k === "wedding" && (
          <>
            <label>
              نوع الحجز
              <input aria-label="الفئة"
                name="category"
                required
                placeholder="قاعة / فستان / ميكب"
                defaultValue={item.category}
              />
            </label>
            <label>
              رقم الهاتف
              <input aria-label="رقم الهاتف" name="phone" type="tel" defaultValue={item.phone} />
            </label>
            <label>
              الإجمالي (ج.م)
              <input aria-label="السعر"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={item.price}
              />
            </label>
            <label>
              المدفوع حتى الآن (ج.م)
              <input aria-label="المبلغ المدفوع"
                name="paid"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={item.paid}
              />
            </label>
            <label className="full">
              تاريخ الحجز
              <input aria-label="التاريخ"
                name="date"
                type="date"
                required
                defaultValue={item.date}
              />
            </label>
          </>
        )}
        {k === "glowup" && (
          <>
            <label>
              المرحلة
              <input aria-label="الفئة"
                name="category"
                defaultValue={item.category}
                placeholder="قبل الفرح بشهر"
              />
            </label>
            <label>
              التاريخ
              <input aria-label="التاريخ"
                name="date"
                type="date"
                required
                defaultValue={item.date}
              />
            </label>
            <label>
              المكان / العيادة
              <input aria-label="المحل أو العيادة" name="store" defaultValue={item.store} />
            </label>
            <label>
              عدد الأيام قبل الفرح (للقالب)
              <input aria-label="عدد الأيام قبل الفرح"
                name="offset"
                type="number"
                min="0"
                max="730"
                defaultValue={item.offset}
              />
            </label>
          </>
        )}
        {k === "guests" && (
          <>
            <label>
              الجهة
              <select aria-label="الفئة"
                name="category"
                defaultValue={item.category || "أهل العروسة"}
              >
                <option>أهل العروسة</option>
                <option>أهل العريس</option>
                <option>الأصدقاء</option>
              </select>
            </label>
            <label>
              عدد الأفراد
              <input aria-label="الكمية المطلوبة"
                type="number"
                name="quantity"
                min="1"
                max="10000"
                defaultValue={item.quantity}
                required
              />
            </label>
          </>
        )}
        {k === "songs" && (
          <label className="full">
            الفئة
            <select aria-label="الفئة"
              name="category"
              defaultValue={item.category || "الزفة والدخلة"}
            >
              <option>الزفة والدخلة</option>
              <option>السلو</option>
              <option>الرقص والهيصة</option>
              <option>أغاني ممنوعة</option>
            </select>
          </label>
        )}
      </div>
      <Button type="submit" busy={busy}>
        حفظ التفاصيل
      </Button>
    </form>
  );
}
