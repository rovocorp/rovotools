import { describe, expect, it } from "vitest";

import { defineTool } from "./define-tool";
import {
  ALLOWED_PLACEMENTS,
  createPolicy,
  isPlacementAllowed,
  resolvePlacementsForPage,
  toolExecutionIndependentOfAds,
} from "./monetization";

describe("monetization policy", () => {
  it("enables ads only with a provider and publisher id", () => {
    expect(createPolicy({ provider: "none" }).adsEnabled).toBe(false);
    expect(createPolicy({ provider: "adsense" }).adsEnabled).toBe(false);
    expect(createPolicy({ provider: "adsense", publisherId: "  " }).adsEnabled).toBe(false);
    const policy = createPolicy({ provider: "adsense", publisherId: "ca-pub-123" });
    expect(policy.adsEnabled).toBe(true);
    expect(policy.publisherId).toBe("ca-pub-123");
  });

  it("restricts placements to the non-intrusive allowlist", () => {
    expect(isPlacementAllowed("tool-footer")).toBe(true);
    expect(isPlacementAllowed("listing-inline")).toBe(true);
    expect(isPlacementAllowed("interstitial")).toBe(false);
    expect(isPlacementAllowed("tool-controls-overlay")).toBe(false);
    expect(ALLOWED_PLACEMENTS).toHaveLength(4);
  });

  it("maps exactly one placement family per page type", () => {
    expect(resolvePlacementsForPage("tool")).toEqual(["tool-footer"]);
    expect(resolvePlacementsForPage("listing")).toEqual(["listing-inline"]);
    expect(resolvePlacementsForPage("blog")).toEqual(["blog-footer"]);
    expect(resolvePlacementsForPage("home")).toEqual(["home-inline"]);
  });

  it("keeps tool execution independent of ad policy", async () => {
    expect(toolExecutionIndependentOfAds()).toBe(true);
    const definition = defineTool({
      id: "policy-probe",
      slug: "policy-probe",
      name: "Policy Probe",
      description: "Probe.",
      category: "utility",
      icon: "probe",
      keywords: [],
      featured: false,
      popular: false,
      supportedPlatforms: ["WEB"],
      processingMode: "LOCAL",
      supportedFormats: [],
      requiresNetwork: false,
      localizationKey: "tools.policy-probe",
      relatedTools: [],
      nameKey: "tools.policy-probe.name",
      descriptionKey: "tools.policy-probe.description",
      metadata: { version: "1.0.0", isOfflineCapable: true, tags: [] },
      inputs: [],
      outputs: [{ id: "ok", type: "boolean", labelKey: "ok" }],
      validate: () => ({ valid: true, errors: [] }),
      execute: async () => ({ ok: true }),
    });
    const before = JSON.stringify({ ...definition, validate: "fn", execute: "fn" });
    void createPolicy({ provider: "adsense", publisherId: "ca-pub-123" });
    void createPolicy({ provider: "none" });
    const after = JSON.stringify({ ...definition, validate: "fn", execute: "fn" });
    expect(after).toBe(before);
    await expect(definition.execute({})).resolves.toEqual({ ok: true });
  });
});
