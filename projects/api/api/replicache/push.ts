import { setTimeout } from "node:timers/promises";

export async function POST(request: Request) {
  await setTimeout(2000);

  return new Response(`Hello after 2000ms`);
}
