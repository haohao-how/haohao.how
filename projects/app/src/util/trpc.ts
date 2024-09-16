import type { ApiRouter } from "@/server/lib/trpc";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<ApiRouter>();
