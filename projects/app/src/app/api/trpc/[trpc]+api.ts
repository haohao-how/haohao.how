import { apiRouter } from "@/server/lib/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: `/api/trpc`,
    req,
    router: apiRouter,
    createContext: () => ({}),
  });

export const GET = handler;
export const POST = handler;
