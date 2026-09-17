'use client';

import FetchAnalyzer from './FetchAnalyzer';

// Bespoke fetch-capable analyzer UIs. Analysis itself stays pure and
// registry-driven (identical results with pasted markup); each wrapper only
// configures the shared FetchAnalyzer shell with the tool's content field,
// which doubles as the paste box for offline use.
export function SeoChecker(): React.ReactElement {
  return (
    <FetchAnalyzer
      toolId="seo-checker"
      contentFieldId="html"
      contentLabel="Page HTML (paste view-source)"
      contentPlaceholder="<html><head><title>…"
      fetchHint="fetches HTML pages"
      analyzeAction="Audit page"
    />
  );
}

export function OpenGraphChecker(): React.ReactElement {
  return (
    <FetchAnalyzer
      toolId="open-graph-checker"
      contentFieldId="html"
      contentLabel="Page HTML (paste view-source)"
      contentPlaceholder="<html><head><title>…"
      fetchHint="fetches HTML pages"
      analyzeAction="Check tags"
    />
  );
}

export function SitemapChecker(): React.ReactElement {
  return (
    <FetchAnalyzer
      toolId="sitemap-checker"
      contentFieldId="xml"
      contentLabel="Sitemap XML (paste file contents)"
      contentPlaceholder="<?xml version…<urlset>"
      fetchHint="fetches XML sitemaps"
      analyzeAction="Check sitemap"
    />
  );
}

export function TagDetector(): React.ReactElement {
  return (
    <FetchAnalyzer
      toolId="tag-detector"
      contentFieldId="html"
      contentLabel="Page HTML (paste view-source)"
      contentPlaceholder="<html><head><title>…"
      fetchHint="fetches HTML pages"
      analyzeAction="Detect tags"
    />
  );
}

export function PerformanceAnalyzer(): React.ReactElement {
  return (
    <FetchAnalyzer
      toolId="performance-analyzer"
      contentFieldId="html"
      contentLabel="Page HTML (paste view-source)"
      contentPlaceholder="<html><head><title>…"
      fetchHint="fetches HTML pages"
      analyzeAction="Analyze weight"
    />
  );
}
