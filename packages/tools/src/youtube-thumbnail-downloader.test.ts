import { describe, expect, it } from "vitest";

import { toolRegistry } from "./registry";
import { registerCoreTools } from "./seed";

registerCoreTools(toolRegistry);

async function run(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const entry = toolRegistry.require("youtube-thumbnail-downloader");
  const v = entry.definition.validate(input);
  expect(v.valid).toBe(true);
  return (await entry.definition.execute(input)) as Record<string, unknown>;
}

describe("youtube-thumbnail-downloader behavior", () => {
  it("is flagged as needing the network", () => {
    const entry = toolRegistry.require("youtube-thumbnail-downloader");
    expect(entry.definition.requiresNetwork).toBe(true);
  });

  it("extracts IDs from every URL shape", async () => {
    const urls = [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/live/dQw4w9WgXcQ?feature=share",
      "dQw4w9WgXcQ",
    ];
    for (const url of urls) {
      const out = await run({ url });
      expect(out["maxres"]).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg");
      expect(out["sd"]).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/sddefault.jpg");
    }
  });

  it("rejects garbage", async () => {
    const entry = toolRegistry.require("youtube-thumbnail-downloader");
    expect(entry.definition.validate({ url: "https://example.com/not-youtube" }).valid).toBe(false);
    expect(entry.definition.validate({ url: "" }).valid).toBe(false);
  });
});
