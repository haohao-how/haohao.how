import { invariant } from "@haohaohow/lib/invariant";
import { Debugger } from "debug";
import OpenAI from "openai";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";
import { DbCache } from "./cache.js";

export const openAiWithCache = async (
  body: ChatCompletionCreateParamsNonStreaming,
  ctx: {
    dbCache: DbCache;
    openai?: OpenAI;
    debug?: Debugger;
  },
) => {
  const openai = ctx.openai ?? new OpenAI();
  const debug = ctx.debug?.extend(`openAi`);
  const cached = ctx.dbCache.get(body);
  if (cached == null) {
    debug?.(`Making OpenAI chat request: %O`, body);
    const completion = await openai.chat.completions.create(body);
    const result = completion.choices[0]?.message.content;
    debug?.(`OpenAI chat response: %O`, result);
    invariant(
      result != null,
      `No result for OpenAI request:\n${JSON.stringify(body, null, 2)}`,
    );
    ctx.dbCache.set(body, result);
    return result;
  }
  invariant(typeof cached === `string`);
  return cached;
};
