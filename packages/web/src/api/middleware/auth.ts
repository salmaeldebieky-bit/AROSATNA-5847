import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { auth } from "../auth";
import { db } from "../database";
import { profiles } from "../database/schema";

export const authed = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session)
    throw new ORPCError("UNAUTHORIZED", { message: "سجّلي الدخول للمتابعة" });
  await db
    .insert(profiles)
    .values({ userId: session.user.id })
    .onConflictDoNothing();
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id));
  return next({ context: { user: session.user, profile: profile! } });
});
export const active = authed.use(({ context, next }) => {
  if (context.profile.status !== "active")
    throw new ORPCError("FORBIDDEN", { message: "الحساب غير مفعّل" });
  return next();
});
export const admin = authed.use(({ context, next }) => {
  if (context.profile.role !== "admin" || context.profile.status !== "active")
    throw new ORPCError("FORBIDDEN", { message: "صلاحيات الإدارة مطلوبة" });
  return next();
});
