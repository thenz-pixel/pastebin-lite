import { headers } from "next/headers"

export async function nowMs() {
  if (process.env.TEST_MODE === "1") {
    const h = await headers();       // await the headers
    const testNow = h.get("x-test-now-ms"); // then get the header
    if (testNow) return Number(testNow);
  }
  return Date.now();
}
