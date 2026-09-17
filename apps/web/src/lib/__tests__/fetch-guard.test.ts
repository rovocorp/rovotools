import { describe, expect, it } from "vitest";
import {
  isBlockedAddress,
  isBlockedHostname,
  isPrivateIPv4,
  isPrivateIPv6,
  isSupportedContentType,
  parseTargetUrl,
} from "../fetch-guard";

describe("isPrivateIPv4", () => {
  it("blocks loopback, private, link-local, multicast and special ranges", () => {
    for (const ip of [
      "127.0.0.1",
      "10.0.0.5",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.10.20",
      "0.0.0.0",
      "224.0.0.1",
      "100.64.0.1",
      "192.0.2.1",
      "203.0.113.5",
    ]) {
      expect(isPrivateIPv4(ip), ip).toBe(true);
    }
  });

  it("allows public addresses and rejects range boundaries", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "172.15.255.255", "172.32.0.1", "192.167.0.1", "100.128.0.1"]) {
      expect(isPrivateIPv4(ip), ip).toBe(false);
    }
  });
});

describe("isPrivateIPv6", () => {
  it("blocks loopback, unique-local, link-local and mapped private", () => {
    for (const ip of ["::1", "::", "fc00::1", "fd12:3456::1", "fe80::1", "febf::1", "::ffff:127.0.0.1", "2001:db8::1"]) {
      expect(isPrivateIPv6(ip), ip).toBe(true);
    }
  });

  it("allows public addresses", () => {
    for (const ip of ["2606:4700:4700::1111", "2001:4860:4860::8888", "::ffff:8.8.8.8"]) {
      expect(isPrivateIPv6(ip), ip).toBe(false);
    }
  });
});

describe("isBlockedAddress", () => {
  it("covers both families", () => {
    expect(isBlockedAddress("127.0.0.1")).toBe(true);
    expect(isBlockedAddress("::1")).toBe(true);
    expect(isBlockedAddress("8.8.8.8")).toBe(false);
  });
});

describe("isBlockedHostname", () => {
  it("rejects localhost, single labels and blanks", () => {
    expect(isBlockedHostname("localhost")).toBe(true);
    expect(isBlockedHostname("LOCALHOST.")).toBe(true);
    expect(isBlockedHostname("intranet")).toBe(true);
    expect(isBlockedHostname("")).toBe(true);
    expect(isBlockedHostname("example.com")).toBe(false);
  });
});

describe("parseTargetUrl", () => {
  it("accepts absolute http(s) URLs", () => {
    expect(parseTargetUrl("https://example.com/page?q=1").hostname).toBe("example.com");
  });

  it("rejects schemes, credentials, relative and oversized input", () => {
    for (const raw of ["file:///etc/passwd", "javascript:alert(1)", "ftp://example.com", "//example.com", "not a url", "", `https://example.com/${"x".repeat(2000)}`]) {
      expect(() => parseTargetUrl(raw), String(raw).slice(0, 30)).toThrow(RangeError);
    }
    expect(() => parseTargetUrl("https://user:pass@example.com")).toThrow(RangeError);
  });
});

describe("isSupportedContentType", () => {
  it("allows markup-like types and rejects the rest", () => {
    expect(isSupportedContentType("text/html; charset=utf-8")).toBe(true);
    expect(isSupportedContentType("application/xml")).toBe(true);
    expect(isSupportedContentType("image/png")).toBe(false);
    expect(isSupportedContentType("application/octet-stream")).toBe(false);
    expect(isSupportedContentType(null)).toBe(false);
  });
});
