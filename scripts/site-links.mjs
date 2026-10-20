/**
 * ClearPath Content — link hygiene for every page written to disk.
 * -------------------------------------------------------------
 * Netlify serves every directory page at its trailing-slash URL and 301s the
 * bare form to it. The site linked, canonicalised and sitemapped the bare form
 * everywhere, so 242 of 243 sitemap URLs redirected and every canonical pointed
 * at a URL that redirected back to the page declaring it.
 *
 * normalizeLinks() rewrites internal links, canonicals, og:url and JSON-LD urls
 * to the form the server answers with 200. Only real directories are touched,
 * so files (/llms.txt, /assets/...) and anchors (/#pricing) are left alone.
 * Every generator writes through writePage(), so new pages cannot regress.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");

const known = new Set();
function isDir(p) {
  if (p.startsWith("/blog/")) return true;
  if (known.has(p)) return true;
  const ok = fs.existsSync(path.join(ROOT, p, "index.html"));
  if (ok) known.add(p);
  return ok;
}
const fix = (pre, host, p, frag) =>
  (p === "/" || p.endsWith("/") || p.startsWith("/assets/") || p.startsWith("/.netlify") || !isDir(p))
    ? null : `${pre}${host || ""}${p}/${frag || ""}"`;

export function normalizeLinks(html) {
  return html
    .replace(/((?:href|content)=")(https:\/\/clearpath-content\.com)?(\/[a-z0-9\/-]*?)(#[^"]*)?"/gi,
      (m, pre, host, p, frag) => fix(pre, host, p, frag) || m)
    .replace(/("(?:url|@id|item|mainEntityOfPage)"\s*:\s*")(https:\/\/clearpath-content\.com)(\/[a-z0-9\/-]*?)(#[^"]*)?"/g,
      (m, pre, host, p, frag) => fix(pre, host, p, frag) || m);
}

/** Write an HTML page with links normalized. Registers its own directory first. */
export function writePage(file, html) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const rel = "/" + path.relative(ROOT, path.dirname(file)).split(path.sep).join("/");
  if (rel !== "/") known.add(rel);
  fs.writeFileSync(file, normalizeLinks(html));
}
