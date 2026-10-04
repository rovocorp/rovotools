# Deploying RovoTools via File Manager (static upload)

Use this when deploying the pre-built static site to shared hosting
(`public_html`). No build, no install, no Node.js flow — framework
auto-detection is never involved, so it cannot fail with
"Unsupported framework or invalid project structure".

> That error comes from Hostinger's framework auto-detection (Node.js /
> app-deployment engine), which requires a `package.json` at the archive
> root. The deploy artifact `apps/web/out.zip` intentionally contains **no**
> `package.json` — it is a finished website, not a project to build. If you
> see that error, the zip was uploaded into the wrong flow (Node.js web app
> / website importer); use the File Manager steps below instead.

## Prerequisites

- `apps/web/out.zip`, freshly built in this repo:
  `pnpm --filter @rovotools/web build`, then zip the **contents** of
  `apps/web/out/` (so `index.html` sits at the zip root, not inside an
  `out/` folder). The current zip is ~10 MB, far below the 256 MB limit.

## Steps

1. hPanel → Websites → Dashboard → Files → **File Manager**.
2. Open the `public_html` folder.
3. Click **Upload** (top-right) and select `apps/web/out.zip`.
4. Right-click the uploaded archive → **Extract** → extract **here**
   (`public_html`), not into a subfolder.
5. Verify `index.html` is directly in `public_html`
   (`public_html/index.html`, not `public_html/out/index.html`).
   If files landed in a subfolder, select them all → **Move** → destination
   `public_html`.
6. Delete the uploaded `.zip` to save space.
7. Open the domain. Then hard-refresh (Ctrl+Shift+R) — browsers cache the
   previous logo/favicon aggressively.

## What to check after upload

| Check | Expected |
|---|---|
| `https://rovotools.com/` | `200`, homepage renders |
| `https://rovotools.com/logo.png` | `200`, transparent logo, no white box |
| `/favicon.ico`, `/icon-192.png` | `200`, dark tile, transparent corners |
| `/sitemap.xml`, `/ads.txt`, `/robots.txt` | `200` |
| A tool page, e.g. `/tools/bmi-calculator` | `200` |
| Legacy URL, e.g. `/tools/emi-calculator/` | `301` → `/tools/loan-calculator/` (`.htaccess` rewrites) |

## Troubleshooting

| Symptom | Meaning | Action |
|---|---|---|
| "Unsupported framework or invalid project structure" during upload | Zip went into a framework-detecting flow (Node.js app / importer), not File Manager | Cancel that flow; follow the File Manager steps above |
| Domain shows 404 / directory listing | Files extracted into `public_html/out/` instead of `public_html/` | Move files up one level (step 5) |
| Old logo/favicon after deploy | Browser or proxy cache | Hard-refresh; favicons can take a day to refresh in some browsers |
| 403 after redeploy (Node.js flow only) | Stale hand-edited `.htaccess` in `public_html` | Redeploy to regenerate it; never hand-edit the generated file |

For SSH or panel-Node.js-flow deploys instead, see `DEPLOY_SSH.md`.
