import test from "node:test";
import { GET } from "../api/hello.js";

void test("GET", () => {
  GET(new Request("http://example.com"));
});
