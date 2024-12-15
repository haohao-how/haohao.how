import { withDrizzle } from "@/server/lib/db";
import { push } from "@/server/lib/push";
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

export async function POST(request: Request) {
  const userId = null as unknown as string;
  const body: unknown = await request.json();

  await withDrizzle(async (db) => {
    await push(db, userId, body);
  });

  return new Response(`Success`);
}
