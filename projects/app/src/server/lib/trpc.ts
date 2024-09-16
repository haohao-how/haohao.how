import { getLucia, getOrCreateUser } from "@/server/lib/auth";
import { withDrizzle } from "@/server/lib/db";
import { invariant } from "@haohaohow/lib/invariant";
import { initTRPC } from "@trpc/server";
import { parseJWT } from "oslo/jwt";
import { z } from "zod";

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
export const { router, procedure } = initTRPC.create();

const authRouter = router({
  signInWithApple: procedure
    .input(
      z.object({
        identityToken: z.string(),
      }),
    )
    .output(
      z
        .object({
          session: z.object({
            id: z.string(),
          }),
          user: z.object({
            id: z.string(),
            name: z.string().optional(),
          }),
        })
        .strict(),
    )
    .mutation(async (opts) => {
      // TODO: validate identity token, e.g. https://arctic.js.org/providers/apple

      const jwt = parseJWT(opts.input.identityToken);
      const subject = jwt?.subject;
      invariant(subject != null);

      const { session, userId } = await withDrizzle(async (db) => {
        const userId = await getOrCreateUser(db, {
          provider: `apple`,
          providerUserId: subject,
        });

        const lucia = getLucia(db);
        const session = await lucia.createSession(userId, {});

        return { session, userId };
      });

      return {
        session: { id: session.id },
        user: { id: userId },
      };
    }),
});

export const apiRouter = router({
  auth: authRouter,
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `Hello ${opts.input.text}`,
      };
    }),

  echo: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .mutation((opts) => {
      return {
        greeting: `echo: ${opts.input.text}`,
      };
    }),
});

// export type definition of API
export type ApiRouter = typeof apiRouter;
