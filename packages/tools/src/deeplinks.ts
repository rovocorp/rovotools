export const WEB_HOST = "rovotools.com";
export const APP_SCHEME = "rovotools";

export type DeepLinkKind = "tool" | "category" | "blog" | "settings" | "home" | "unknown";

export type UserSafeSettingsScreen = "general" | "theme" | "privacy" | "about";

export interface ToolDeepLink {
  readonly kind: "tool";
  readonly slug: string;
}

export interface CategoryDeepLink {
  readonly kind: "category";
  readonly category: string;
}

export interface BlogDeepLink {
  readonly kind: "blog";
  readonly slug: string;
}

export interface SettingsDeepLink {
  readonly kind: "settings";
  readonly screen: UserSafeSettingsScreen;
}

export interface HomeDeepLink {
  readonly kind: "home";
}

export interface UnknownDeepLink {
  readonly kind: "unknown";
  readonly path: string;
}

export type DeepLink =
  | ToolDeepLink
  | CategoryDeepLink
  | BlogDeepLink
  | SettingsDeepLink
  | HomeDeepLink
  | UnknownDeepLink;

const SENSITIVE_QUERY_KEYS: ReadonlyArray<string> = [
  "token",
  "access_token",
  "id_token",
  "refresh_token",
  "auth",
  "authorization",
  "password",
  "secret",
  "api_key",
  "apikey",
  "key",
  "session",
  "sessionid",
  "email",
];

function normalizePath(path: string): string {
  const withoutTrailing = path.replace(/\/+$/, "");
  return withoutTrailing === "" ? "/" : withoutTrailing.toLowerCase();
}

function parsePath(path: string): DeepLink {
  const normalized = normalizePath(path);
  if (normalized === "/") {
    return { kind: "home" };
  }

  const toolMatch = /^\/tools\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(normalized);
  if (toolMatch?.[1] !== undefined) {
    return { kind: "tool", slug: toolMatch[1] };
  }

  const categoryMatch = /^\/tools\/category\/([a-z]+)$/.exec(normalized);
  if (categoryMatch?.[1] !== undefined) {
    return { kind: "category", category: categoryMatch[1] };
  }

  const blogMatch = /^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(normalized);
  if (blogMatch?.[1] !== undefined) {
    return { kind: "blog", slug: blogMatch[1] };
  }

  if (normalized === "/settings" || normalized === "/settings/theme") {
    return { kind: "settings", screen: "theme" };
  }
  if (normalized === "/privacy") {
    return { kind: "settings", screen: "privacy" };
  }
  if (normalized === "/about") {
    return { kind: "settings", screen: "about" };
  }
  if (normalized === "/blog") {
    return { kind: "unknown", path: normalized };
  }

  return { kind: "unknown", path: normalized };
}

export function hasSensitiveQueryParams(url: string): boolean {
  const queryIndex = url.indexOf("?");
  if (queryIndex < 0) {
    return false;
  }
  const query = url.slice(queryIndex + 1).toLowerCase();
  return SENSITIVE_QUERY_KEYS.some((key) => query.includes(key));
}

export function stripSensitiveQueryParams(url: string): string {
  const queryIndex = url.indexOf("?");
  if (queryIndex < 0) {
    return url;
  }
  const base = url.slice(0, queryIndex);
  const pairs = url.slice(queryIndex + 1).split("&");
  const safe = pairs.filter((pair) => {
    const name = pair.split("=")[0]?.toLowerCase() ?? "";
    return !SENSITIVE_QUERY_KEYS.some((key) => name === key || name.endsWith(`_${key}`));
  });
  return safe.length === 0 ? base : `${base}?${safe.join("&")}`;
}

function extractPath(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (trimmed === "") {
    return null;
  }
  try {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "https:" && parsed.hostname.toLowerCase() === WEB_HOST) {
        return parsed.pathname;
      }
      if (parsed.protocol === `${APP_SCHEME}:`) {
        return `/${parsed.hostname}${parsed.pathname}`.replace(/\/+$/, "") || "/";
      }
      return null;
    }
    if (trimmed.startsWith("/")) {
      return trimmed.split("?")[0] ?? "/";
    }
    return null;
  } catch {
    return null;
  }
}

export function parseDeepLink(rawUrl: string): DeepLink | null {
  if (hasSensitiveQueryParams(rawUrl)) {
    return null;
  }
  const path = extractPath(rawUrl);
  if (path === null) {
    return null;
  }
  return parsePath(path.split("?")[0] ?? "/");
}

export function buildWebUrl(link: DeepLink, webOrigin = `https://${WEB_HOST}`): string {
  switch (link.kind) {
    case "tool":
      return `${webOrigin}/tools/${link.slug}`;
    case "category":
      return `${webOrigin}/tools/category/${link.category}`;
    case "blog":
      return `${webOrigin}/blog/${link.slug}`;
    case "settings":
      if (link.screen === "privacy") {
        return `${webOrigin}/privacy`;
      }
      if (link.screen === "about") {
        return `${webOrigin}/about`;
      }
      return `${webOrigin}/settings`;
    case "home":
      return `${webOrigin}/`;
    case "unknown":
      return `${webOrigin}${link.path.startsWith("/") ? link.path : `/${link.path}`}`;
  }
}

export function buildAppRoute(link: DeepLink): string | null {
  switch (link.kind) {
    case "tool":
      return `/tools/${link.slug}`;
    case "category":
      return `/tools?category=${link.category}`;
    case "blog":
      // No native blog screen yet: callers should fall back to the web URL.
      return null;
    case "settings":
      if (link.screen === "privacy") {
        return "/privacy";
      }
      if (link.screen === "about") {
        return "/about";
      }
      return "/settings";
    case "home":
      return "/";
    case "unknown":
      return null;
  }
}

export function buildCustomSchemeUrl(link: DeepLink): string | null {
  const route = buildAppRoute(link);
  if (route === null) {
    return null;
  }
  return `${APP_SCHEME}://${route.replace(/^\//, "")}`;
}
