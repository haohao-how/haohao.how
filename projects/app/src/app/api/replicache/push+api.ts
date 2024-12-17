import { pushRequestSchema } from "@/data/rizzle";
import { withDrizzle } from "@/server/lib/db";
import { push } from "@/server/lib/replicache";

export async function POST(request: Request) {
  const userId = null as unknown as string; // TODO
  const pushRequest = pushRequestSchema.parse(await request.json());

  await withDrizzle(async (db) => {
    await push(db, userId, pushRequest);
  });
}
