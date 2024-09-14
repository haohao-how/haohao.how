import { getLucia } from "@/server/auth";
import { Drizzle, withDrizzle } from "@/server/db";
import { authOAuth2, user } from "@/server/schema";
import { invariant } from "@haohaohow/lib/invariant";
import { and, eq } from "drizzle-orm";
import { parseJWT } from "oslo/jwt";
import { z } from "zod";

const requestBodySchema = z.object({
  identityToken: z.string(),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
});

const sessionSchema = z.object({
  id: z.string(),
});

const responseBodySchema = z
  .object({
    session: sessionSchema,
    user: userSchema,
  })
  .strict();

async function getOrCreateUser(
  db: Drizzle,
  options: {
    provider: string;
    providerUserId: string;
  },
) {
  const existingOAuth2 = await db.query.authOAuth2.findFirst({
    where: and(
      eq(authOAuth2.provider, options.provider),
      eq(authOAuth2.providerUserId, options.providerUserId),
    ),
  });

  // TODO: audit logging of when the method was used.

  if (existingOAuth2) {
    return existingOAuth2.userId;
  }

  // Create a new user
  const [newUser] = await db.insert(user).values({}).returning();

  invariant(newUser !== undefined);

  // create a new OAuth2
  const [newOAuth2] = await db
    .insert(authOAuth2)
    .values({
      provider: options.provider,
      providerUserId: options.providerUserId,
      userId: newUser.id,
    })
    .returning();

  invariant(newOAuth2 !== undefined);

  return newUser.id;
}

export async function POST(request: Request) {
  const body = requestBodySchema.parse(await request.json());

  // TODO: validate identity token, e.g. https://arctic.js.org/providers/apple

  const jwt = parseJWT(body.identityToken);
  const subject = jwt?.subject;
  invariant(subject != null);

  return await withDrizzle(async (db) => {
    const userId = await getOrCreateUser(db, {
      provider: `apple`,
      providerUserId: subject,
    });

    const lucia = getLucia(db);
    const session = await lucia.createSession(userId, {});

    return Response.json({
      session: { id: session.id },
      user: { id: userId },
    } satisfies z.infer<typeof responseBodySchema>);
  });
}
