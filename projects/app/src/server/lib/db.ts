import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool as PgPool } from "pg";
import z from "zod";
import * as schema from "../schema";

const env = z.object({ DATABASE_URL: z.string() }).parse(process.env);
const IS_NEON = env.DATABASE_URL.includes(`neon.tech`);

export type Drizzle = NodePgDatabase<typeof schema>;
export type Transaction = Parameters<Parameters<Drizzle[`transaction`]>[0]>[0];
export type TransactionBodyFn<R> = (tx: Transaction) => Promise<R>;

export async function createPool(): Promise<PgPool> {
  let Pool: typeof PgPool;
  if (IS_NEON) {
    Pool = (await import(`@neondatabase/serverless`)).Pool;
    const { neonConfig } = await import(`@neondatabase/serverless`);
    const { default: ws } = await import(`ws`);
    neonConfig.webSocketConstructor = ws;
  } else {
    Pool = (await import(`pg`)).default.Pool;
  }

  const pool = new Pool({ connectionString: env.DATABASE_URL });

  // the pool will emit an error on behalf of any idle clients
  // it contains if a backend error or network partition happens
  pool.on(`error`, (err) => {
    // eslint-disable-next-line no-console
    console.error(`Unexpected error on idle pool client`, err);
  });

  return pool;
}

async function withDrizzleAndPool<R>(
  f: (db: Drizzle) => Promise<R>,
  pool: PgPool,
): Promise<R> {
  const client = await pool.connect();

  try {
    await client.query(
      `SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL SERIALIZABLE`,
    );
    const db = drizzle(client, { schema });
    return await f(db);
  } finally {
    client.release();
  }
}

export async function withDrizzle<R>(f: (db: Drizzle) => Promise<R>) {
  const pool = await createPool();
  try {
    return await withDrizzleAndPool(f, pool);
  } finally {
    await pool.end();
  }
}

export async function transactWithExecutor<R>(
  tx: Transaction | Drizzle,
  body: TransactionBodyFn<R>,
) {
  let retries = 3;
  do {
    try {
      return await tx.transaction(body);
    } catch (e) {
      if (retries > 0 && shouldRetryTransaction(e)) {
        // eslint-disable-next-line no-console
        console.log(
          `Retrying transaction due to SERIALIZABLE isolation error (attempt ${retries})`,
          e,
        );
        continue;
      }
      throw e;
    }
  } while (retries-- > 0);
}

// Because we are using SERIALIZABLE isolation level, we need to be prepared to retry transactions.
// stackoverflow.com/questions/60339223/node-js-transaction-coflicts-in-postgresql-optimistic-concurrency-control-and
function shouldRetryTransaction(err: unknown) {
  // TODO: use zod to decode

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  const code = typeof err === `object` ? String((err as any).code) : null;
  return code === `40001` || code === `40P01`;
}

/**
 * Invokes a supplied function within a transaction.
 * @param body Function to invoke. If this throws, the transaction will be rolled
 * back. The thrown error will be re-thrown.
 */
export async function transact<R>(body: TransactionBodyFn<R>) {
  return await withDrizzle(async (executor) => {
    return await transactWithExecutor(executor, body);
  });
}
