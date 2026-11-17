import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { active, authed } from "../middleware/auth";
import { db } from "../database";
import { entries, profiles, receipts, settings } from "../database/schema";
import {
  configSchema,
  defaultConfig,
  itemSchema,
  profileSchema,
  seedItems,
  type Config,
  type Item,
} from "../../shared/planner";

export async function getConfig(): Promise<Config> {
  await db
    .insert(settings)
    .values({
      id: "config",
      data: defaultConfig as unknown as Record<string, unknown>,
    })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, "config"));
  return configSchema.parse(row!.data);
}
export const planner = {
  config: base.handler(getConfig),
  me: authed.handler(async ({ context }) => {
    const r = await db
      .select({
        id: receipts.id,
        status: receipts.status,
        note: receipts.note,
        amount: receipts.amount,
        submittedAt: receipts.submittedAt,
      })
      .from(receipts)
      .where(eq(receipts.userId, context.user.id));
    return {
      user: {
        id: context.user.id,
        name: context.user.name,
        email: context.user.email,
      },
      profile: context.profile,
      receipts: r,
    };
  }),
  list: active.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(entries)
      .where(eq(entries.userId, context.user.id));
    return rows.map((r) =>
      itemSchema.parse({ ...r.data, id: r.id, kind: r.kind }),
    );
  }),
  onboard: active.input(profileSchema).handler(async ({ context, input }) => {
    const config = await getConfig();
    await db.transaction(async (tx) => {
      const [p] = await tx
        .select()
        .from(profiles)
        .where(eq(profiles.userId, context.user.id));
      if (p?.onboarded)
        throw new ORPCError("CONFLICT", { message: "تمت التهيئة بالفعل" });
      const items = seedItems(config, input.weddingDate);
      if (items.length)
        await tx
          .insert(entries)
          .values(
            items.map((i) => ({
              id: i.id,
              userId: context.user.id,
              kind: i.kind,
              data: i as unknown as Record<string, unknown>,
            })),
          );
      await tx
        .update(profiles)
        .set({ ...input, onboarded: true })
        .where(eq(profiles.userId, context.user.id));
    });
    return { ok: true };
  }),
  profile: active.input(profileSchema).handler(async ({ context, input }) => {
    await db
      .update(profiles)
      .set(input)
      .where(eq(profiles.userId, context.user.id));
    return { ok: true };
  }),
  save: active.input(itemSchema).handler(async ({ context, input }) => {
    const [existing] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, input.id));
    if (existing && existing.userId !== context.user.id)
      throw new ORPCError("FORBIDDEN");
    const item: Item = {
      ...input,
      done:
        input.kind === "gihaz" ? input.bought === input.quantity : input.done,
    };
    if (existing)
      await db
        .update(entries)
        .set({
          data: item as unknown as Record<string, unknown>,
          kind: item.kind,
        })
        .where(
          and(eq(entries.id, item.id), eq(entries.userId, context.user.id)),
        );
    else
      await db
        .insert(entries)
        .values({
          id: item.id,
          userId: context.user.id,
          kind: item.kind,
          data: item as unknown as Record<string, unknown>,
        });
    return item;
  }),
  remove: active
    .input(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      await db
        .delete(entries)
        .where(
          and(eq(entries.id, input.id), eq(entries.userId, context.user.id)),
        );
      return { ok: true };
    }),
  receipt: authed
    .input(
      z.object({
        sender: z.string().trim().min(3).max(200),
        reference: z.string().trim().max(100),
        image: z
          .string()
          .max(2800000)
          .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/),
      }),
    )
    .handler(async ({ context, input }) => {
      if (!["pending", "rejected"].includes(context.profile.status))
        throw new ORPCError("FORBIDDEN", {
          message: "لا يمكن إرسال إيصال في الحالة الحالية",
        });
      const config = await getConfig();
      await db.transaction(async (tx) => {
        const [p] = await tx
          .select()
          .from(profiles)
          .where(eq(profiles.userId, context.user.id));
        if (!p || !["pending", "rejected"].includes(p.status))
          throw new ORPCError("CONFLICT");
        await tx
          .insert(receipts)
          .values({
            ...input,
            id: crypto.randomUUID(),
            userId: context.user.id,
            amount: config.subscriptionPrice,
            submittedAt: new Date().toISOString(),
          });
        await tx
          .update(profiles)
          .set({ status: "under_review" })
          .where(eq(profiles.userId, context.user.id));
      });
      return { ok: true };
    }),
};
