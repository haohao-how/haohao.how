import { pushRequestSchema } from "@/data/rizzle";
import { withDrizzle } from "@/server/lib/db";
import { push } from "@/server/lib/replicache";

export async function POST(request: Request) {
  const userId = null as unknown as string; // TODO
  const pushRequest = pushRequestSchema.parse(await request.json());

  const response = await withDrizzle(async (db) => {
    return await push(db, userId, pushRequest);
  });

  return Response.json(response);
}
