import test from "node:test";
import { GET } from "../../../../app/api/replicache/push+api.js";

void test(`GET`, async () => {
  await GET(new Request(`http://example.com`));
});
