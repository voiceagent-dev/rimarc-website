// Turns every page into ready-made HTML after `vite build`, so the page appears instantly and search
// engines can read it. Each page gets its own title, description, canonical link and social tags.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const { render, PAGES, ORIGIN } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const template = await readFile(path.join(dist, "index.html"), "utf8");

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// JSON-LD is a data block (not run as script), so the strict Content-Security-Policy still applies.
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${ORIGIN}/#organization`,
  name: "RIMARC AI",
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/icon-512.png`,
  description: PAGES["/"].description,
};
const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${ORIGIN}/#website`,
  name: "RIMARC AI",
  url: `${ORIGIN}/`,
  publisher: { "@id": `${ORIGIN}/#organization` },
};

// Replaces one tag in the page. A function replacement keeps any "$" in page text literal.
function setTag(html, pattern, replacement, label) {
  const found = typeof pattern === "string" ? html.includes(pattern) : pattern.test(html);
  if (!found) throw new Error(`prerender: ${label} not found in index.html`);
  return html.replace(pattern, () => replacement);
}

function pageHtml(route) {
  const meta = PAGES[route];
  const url = route === "/404" ? `${ORIGIN}/` : `${ORIGIN}${route}`;
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  let html = template;
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, "title");
  html = setTag(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${desc}" />`, "description");
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`, "og:title");
  html = setTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${desc}" />`, "og:description");
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`, "og:url");
  if (meta.indexable === false) {
    html = setTag(html, /\s*<link rel="canonical" href="[^"]*" \/>/, `\n    <meta name="robots" content="noindex" />`, "canonical");
  } else {
    html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`, "canonical");
  }
  const extra = route === "/" ? `    ${jsonLd(organization)}\n    ${jsonLd(website)}\n` : "";
  html = html.replace("</head>", () => `${extra}  </head>`);
  const body = render(route === "/404" ? "/this-page-does-not-exist" : route);
  return setTag(html, '<div id="root"></div>', `<div id="root">${body}</div>`, "root element");
}

for (const route of Object.keys(PAGES)) {
  const file = route === "/" ? "index.html" : route === "/404" ? "404.html" : path.join(route.slice(1), "index.html");
  const out = path.join(dist, file);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, pageHtml(route));
  console.log(`prerendered ${route} -> dist/${file}`);
}

// Sitemap with every indexable page, rebuilt on each build.
const today = new Date().toISOString().slice(0, 10);
const urls = Object.entries(PAGES)
  .filter(([, m]) => m.indexable !== false)
  .map(([r]) => `  <url><loc>${ORIGIN}${r}</loc><lastmod>${today}</lastmod></url>`)
  .join("\n");
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
await rm(ssrDir, { recursive: true, force: true });
