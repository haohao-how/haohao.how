import test from "node:test";
import { GET } from "./route.js";

void test("GET", () => {
  GET(new Request("http://example.com"));
});
