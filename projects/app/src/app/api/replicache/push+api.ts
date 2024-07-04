import { invariant } from "@haohaohow/lib/invariant";
import { nanoid } from "nanoid";
import { setTimeout } from "node:timers/promises";

export async function GET(request: Request) {
  request;
  await setTimeout(2000);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  invariant(1 === 1);

  return new Response(`Hello after 2000ms nanoid=${nanoid()}`);
}
