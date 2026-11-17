import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { admin as protectedAdmin } from "../middleware/auth";
import { db } from "../database";
import {
  profiles,
  receipts,
  settings,
  user,
  entries,
} from "../database/schema";
import { configSchema, itemSchema, profileSchema } from "../../shared/planner";

async function requireBride(id: string) {
  const [p] = await db.select().from(profiles).where(eq(profiles.userId, id));
  if (!p || p.role !== "bride") throw new ORPCError("NOT_FOUND");
  return p;
}

export const admin = {
  bride: protectedAdmin
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const profile = await requireBride(input.id);
      const [u] = await db
        .select({ name: user.name, email: user.email })
        .from(user)
        .where(eq(user.id, input.id));
      const rows = await db
        .select()
        .from(entries)
        .where(eq(entries.userId, input.id));
      return {
        profile,
        user: u!,
        items: rows.map((r) =>
          itemSchema.parse({ ...r.data, id: r.id, kind: r.kind }),
        ),
      };
    }),
  brideSave: protectedAdmin
    .input(z.object({ userId: z.string(), item: itemSchema }))
    .handler(async ({ input }) => {
      await requireBride(input.userId);
      const [existing] = await db
        .select()
        .from(entries)
        .where(eq(entries.id, input.item.id));
      if (existing && existing.userId !== input.userId)
        throw new ORPCError("FORBIDDEN");
      const item = {
        ...input.item,
        done:
          input.item.kind === "gihaz"
            ? input.item.bought === input.item.quantity
            : input.item.done,
      };
      if (existing)
        await db
          .update(entries)
          .set({ data: item, kind: item.kind })
          .where(
            and(eq(entries.id, item.id), eq(entries.userId, input.userId)),
          );
      else
        await db
          .insert(entries)
          .values({
            id: item.id,
            userId: input.userId,
            kind: item.kind,
            data: item,
          });
      return { ok: true };
    }),
  brideRemove: protectedAdmin
    .input(z.object({ userId: z.string(), id: z.string() }))
    .handler(async ({ input }) => {
      await requireBride(input.userId);
      await db
        .delete(entries)
        .where(and(eq(entries.id, input.id), eq(entries.userId, input.userId)));
      return { ok: true };
    }),
  brideProfile: protectedAdmin
    .input(z.object({ userId: z.string(), profile: profileSchema }))
    .handler(async ({ input }) => {
      await requireBride(input.userId);
      await db
        .update(profiles)
        .set(input.profile)
        .where(eq(profiles.userId, input.userId));
      return { ok: true };
    }),
  list: protectedAdmin.handler(async () => {
    const brides = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        status: profiles.status,
        weddingDate: profiles.weddingDate,
        onboarded: profiles.onboarded,
      })
      .from(user)
      .innerJoin(profiles, eq(profiles.userId, user.id))
      .where(eq(profiles.role, "bride"));
    const payments = await db
      .select({
        id: receipts.id,
        userId: receipts.userId,
        sender: receipts.sender,
        reference: receipts.reference,
        amount: receipts.amount,
        status: receipts.status,
        note: receipts.note,
        submittedAt: receipts.submittedAt,
      })
      .from(receipts)
      .orderBy(desc(receipts.submittedAt));
    return { brides, payments };
  }),
  receipt: protectedAdmin
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const [r] = await db
        .select()
        .from(receipts)
        .where(eq(receipts.id, input.id));
      if (!r) throw new ORPCError("NOT_FOUND");
      return r;
    }),
  review: protectedAdmin
    .input(
      z.object({
        id: z.string(),
        approve: z.boolean(),
        note: z.string().trim().max(300),
      }),
    )
    .handler(async ({ context, input }) => {
      if (!input.approve && !input.note)
        throw new ORPCError("BAD_REQUEST", { message: "اكتبي سبب الرفض" });
      await db.transaction(async (tx) => {
        const [r] = await tx
          .select()
          .from(receipts)
          .where(eq(receipts.id, input.id));
        if (!r || r.status !== "under_review")
          throw new ORPCError("CONFLICT", {
            message: "تمت مراجعة هذا الإيصال بالفعل",
          });
        await tx
          .update(receipts)
          .set({
            status: input.approve ? "approved" : "rejected",
            note: input.note,
            reviewedBy: context.user.id,
            reviewedAt: new Date().toISOString(),
          })
          .where(eq(receipts.id, input.id));
        await tx
          .update(profiles)
          .set({ status: input.approve ? "active" : "rejected" })
          .where(eq(profiles.userId, r.userId));
      });
      return { ok: true };
    }),
  status: protectedAdmin
    .input(z.object({ id: z.string(), suspend: z.boolean() }))
    .handler(async ({ input }) => {
      const [p] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, input.id));
      if (!p || p.role === "admin") throw new ORPCError("FORBIDDEN");
      if (input.suspend && p.status !== "active")
        throw new ORPCError("BAD_REQUEST");
      if (!input.suspend && p.status !== "suspended")
        throw new ORPCError("BAD_REQUEST");
      await db
        .update(profiles)
        .set({ status: input.suspend ? "suspended" : "active" })
        .where(eq(profiles.userId, input.id));
      return { ok: true };
    }),
  config: protectedAdmin.input(configSchema).handler(async ({ input }) => {
    await db
      .update(settings)
      .set({ data: input as unknown as Record<string, unknown> })
      .where(eq(settings.id, "config"));
    return { ok: true };
  }),
};
