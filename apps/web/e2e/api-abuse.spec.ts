import { expect, test } from "@playwright/test";

// Abuse + contract tests for the API surface. Assumes the offline-first
// no-database environment (DATABASE_URL unset): favorites persistence
// answers 501 and reads return empty — that contract is asserted, not the
// Postgres-backed behavior, which needs staging.
// x-forwarded-for isolates the rate-limit probe onto its own budget so it
// can never starve the page-flow suites sharing the server.
const ABUSE_IP = { "x-forwarded-for": "e2e-api-abuse-probe" };

test("contact accepts a valid submission", async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/contact`, {
    headers: { origin: baseURL ?? "" },
    data: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Hello",
      message: "A perfectly reasonable enquiry message.",
    },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
});

test("contact rejects invalid input with field issues", async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/contact`, {
    headers: { origin: baseURL ?? "" },
    data: { name: "A", email: "not-an-email", subject: "Hi", message: "short" },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toBeDefined();
  expect(body.issues.email).toBeDefined();
});

test("contact honeypot is silently accepted without storing", async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/contact`, {
    headers: { origin: baseURL ?? "" },
    data: {
      name: "Bot",
      email: "bot@example.com",
      subject: "Buy now",
      message: "A perfectly reasonable enquiry message.",
      website: "http://spam.example",
    },
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
});

test("contact rejects cross-origin and origin-less mutations", async ({ request, baseURL }) => {
  const payload = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Hello",
    message: "A perfectly reasonable enquiry message.",
  };
  const noOrigin = await request.post(`${baseURL}/api/contact`, { data: payload });
  expect(noOrigin.status()).toBe(403);
  const foreign = await request.post(`${baseURL}/api/contact`, {
    headers: { origin: "https://evil.example" },
    data: payload,
  });
  expect(foreign.status()).toBe(403);
  expect(await foreign.json()).toEqual({ error: "Forbidden." });
});

test("contact rejects malformed JSON and oversized messages", async ({ request, baseURL }) => {
  const malformed = await request.post(`${baseURL}/api/contact`, {
    headers: { origin: baseURL ?? "", "content-type": "application/json" },
    data: "{not json",
  });
  expect(malformed.status()).toBe(400);
  const oversized = await request.post(`${baseURL}/api/contact`, {
    headers: { origin: baseURL ?? "" },
    data: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Hello",
      message: "x".repeat(6000),
    },
  });
  expect(oversized.status()).toBe(400);
});

test("unsupported methods are not routed", async ({ request, baseURL }) => {
  const response = await request.put(`${baseURL}/api/contact`, {
    headers: { origin: baseURL ?? "" },
    data: {},
  });
  expect(response.status()).toBe(405);
});

test("tools search validates query params", async ({ request, baseURL }) => {
  const ok = await request.get(`${baseURL}/api/tools?limit=2`);
  expect(ok.status()).toBe(200);
  const body = await ok.json();
  expect(Array.isArray(body.tools)).toBe(true);
  expect(body.tools.length).toBeLessThanOrEqual(2);
  const bad = await request.get(`${baseURL}/api/tools?category=nope&limit=500`);
  expect(bad.status()).toBe(400);
});

test("favorites honors the no-database contract", async ({ request, baseURL }) => {
  const read = await request.get(`${baseURL}/api/favorites?deviceId=test-device`);
  expect(read.status()).toBe(200);
  expect(await read.json()).toEqual({ favorites: [], synced: false });
  const write = await request.post(`${baseURL}/api/favorites`, {
    headers: { origin: baseURL ?? "" },
    data: { deviceId: "test-device", favorites: ["bmi-calculator"] },
  });
  expect(write.status()).toBe(501);
});

test("API rate limiting trips after the budget is spent", async ({ request, baseURL }) => {
  let last = 200;
  for (let i = 0; i < 61; i += 1) {
    const response = await request.get(`${baseURL}/api/tools?limit=1`, { headers: ABUSE_IP });
    last = response.status();
    if (last === 429) {
      break;
    }
  }
  expect(last).toBe(429);
  const throttled = await request.get(`${baseURL}/api/tools?limit=1`, { headers: ABUSE_IP });
  expect(throttled.status()).toBe(429);
  expect(await throttled.json()).toEqual({ error: "Too many requests." });
});
