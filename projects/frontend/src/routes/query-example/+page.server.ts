import { session } from "$lib/db/schema";
import { db } from "$lib/db/server";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
  const result = await db.select().from(session);
  return {
    result,
  };
}) satisfies PageServerLoad;

export const actions = {
  saveSession: async ({ cookies, request }) => {
    const data = await request.formData();
    const ipAddress = data.get("ip-address");
    if (ipAddress == null || typeof ipAddress != "string") {
      return { success: false };
    }
    try {
      const rows = await db.insert(session).values({ ipAddress }).returning();
      cookies.set("session-id", rows[0].id, { path: "/" });
      return { success: true, sessionId: rows[0].id };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      } else {
        return { success: false, error: "Unknown error" };
      }
    }
  },
} satisfies Actions;
