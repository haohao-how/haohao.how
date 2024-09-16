import { withDrizzle } from "@/server/lib/db";
import { user } from "@/server/schema";
import { invariant } from "@haohaohow/lib/invariant";
import { count } from "drizzle-orm";

export async function GET(request: Request) {
  const [row] = await withDrizzle(async (db) => {
    return await db.select({ count: count() }).from(user);
  });

  invariant(row !== undefined);

  return new Response(`Hello ${request.method}. There are ${row.count} users.`);
}
