import { invariant } from "@haohaohow/lib/invariant";
import { nanoid } from "nanoid";
import { setTimeout } from "node:timers/promises";

export async function POST(request: Request) {
  await setTimeout(2000);
  invariant(1 === 1);

  return new Response(`Hello after 2000ms nanoid=${nanoid()}`);
}
