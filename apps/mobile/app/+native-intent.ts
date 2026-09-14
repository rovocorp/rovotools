import { buildAppRoute, parseDeepLink, WEB_HOST } from "@rovotools/tools";

/**
 * Central deep-link entry point (Expo Router "native intent").
 *
 * Universal links (https://rovotools.com/…), app links, and the
 * rovotools:// custom scheme all funnel through the shared parser, so the
 * mobile route map can never drift from the canonical web URLs.
 *
 * Links carrying sensitive query params are rejected by the parser and land
 * on home — tokens and secrets must never enter navigation state.
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  const candidate = path.includes("://") ? path : `https://${WEB_HOST}${path.startsWith("/") ? path : `/${path}`}`;
  const link = parseDeepLink(candidate);
  if (link === null) {
    return "/";
  }
  return buildAppRoute(link) ?? "/";
}
