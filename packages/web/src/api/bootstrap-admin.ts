import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "./database";
import { profiles, user } from "./database/schema";
import { getConfig } from "./routes/planner";

const email = "salmaeldebieky@gmail.com";
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!password || password.length < 12)
  throw new Error("Admin password must be at least 12 characters");
const [exists] = await db.select().from(user).where(eq(user.email, email));
if (exists) throw new Error("Admin user already exists; refusing to overwrite");
const result = await auth.api.signUpEmail({
  body: { email, password, name: "سلمى" },
});
await db
  .insert(profiles)
  .values({
    userId: result.user.id,
    role: "admin",
    status: "active",
    onboarded: true,
  });
await getConfig();
console.log(
  "Admin account created with hashed password and server-owned role.",
);
