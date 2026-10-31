// Downloads the site photos once and converts them to responsive AVIF/WebP files.
// Photos are from Unsplash (https://unsplash.com/license): free for commercial use.
// Run: npm run images
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(ROOT, ".source-images");
const OUT = path.join(ROOT, "..", "client", "public", "images");
const WIDTHS = [640, 1024, 1600, 2400];

// slug -> Unsplash photo id. Each slug is used in exactly one place on the site.
export const PHOTOS = {
  "hero-ai": "1677442136019-21780ecad995",
  "demo-dubai-skyline": "1512453979798-5ea266f8880c",
  "service-agents": "1485827404703-89b55fcc595e",
  "service-voice": "1563986768609-322da13575f3",
  "service-workflow": "1581291518857-4e27b48ff24e",
  "service-assistants": "1620712943543-bcc4688e7485",
  "service-integration": "1544197150-b99a580bb7a8",
  "service-consulting": "1552664730-d307ca884978",
  "card-voice-dubai": "1518684079-3c830dcef090",
  "card-coming-soon": "1551288049-bebda4e38f71",
  "trust-security": "1573164713988-8665fc963095",
  "cta-laptop": "1531297484001-80022131f5a1",
  "about-team": "1521737604893-d14cc237f11d",
  "about-mission": "1600880292203-757bb62b4baf",
  "about-values": "1517245386807-bb43f82c33c4",
  "contact-office": "1556761175-b413da4baf72",
  "demo-show-apartment": "1502672260266-1c1ef2d93688",
};

const exists = (p) => access(p).then(() => true, () => false);

await mkdir(SRC, { recursive: true });
await mkdir(OUT, { recursive: true });
const manifest = {};

for (const [slug, id] of Object.entries(PHOTOS)) {
  const src = path.join(SRC, `${slug}.jpg`);
  if (!(await exists(src))) {
    const url = `https://images.unsplash.com/photo-${id}?w=2400&q=90&fm=jpg`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed for ${slug}: ${res.status}`);
    await writeFile(src, Buffer.from(await res.arrayBuffer()));
  }
  const img = sharp(src);
  const meta = await img.metadata();
  const widths = WIDTHS.filter((w) => w <= meta.width);
  for (const w of widths) {
    await sharp(src).resize({ width: w }).avif({ quality: 55, effort: 4 }).toFile(path.join(OUT, `${slug}-${w}.avif`));
    await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(path.join(OUT, `${slug}-${w}.webp`));
  }
  // A tiny blurred placeholder shown while the full image loads.
  const blur = await sharp(src).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  manifest[slug] = {
    widths,
    ratio: +(meta.width / meta.height).toFixed(4),
    placeholder: `data:image/webp;base64,${blur.toString("base64")}`,
  };
  console.log(`${slug}: ${widths.join(", ")}`);
}

await writeFile(
  path.join(ROOT, "..", "client", "src", "data", "images.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log("Done.");
