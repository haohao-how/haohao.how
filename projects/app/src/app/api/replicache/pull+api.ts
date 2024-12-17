import { pullRequestSchema } from "@/data/rizzle";
import { withDrizzle } from "@/server/lib/db";
import { pull } from "@/server/lib/replicache";

export async function POST(request: Request) {
  const userId = null as unknown as string; // TODO;
  const pullRequest = pullRequestSchema.parse(await request.json());

  const result = await withDrizzle(async (db) => {
    return await pull(db, userId, pullRequest);
  });

  return new Response(JSON.stringify(result));
}
