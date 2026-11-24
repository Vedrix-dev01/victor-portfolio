// Captures a screenshot of every live project in src/lib/data.ts and writes
// them to public/shots with a manifest the page reads at build time.
//
//   npm i --no-save playwright && npx playwright install chromium
//   node scripts/shots.mjs
//
// Web projects are captured at 1440x900. App Store links use the first
// iPhone screenshot from the app's own listing.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "public", "shots");
fs.mkdirSync(out, { recursive: true });

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Read name/href pairs straight from the data file so there is one list to maintain.
const data = fs.readFileSync(path.join(root, "src", "lib", "data.ts"), "utf8");
const projects = [...data.matchAll(/name:\s*"([^"]+)"[\s\S]*?href:\s*(?:"([^"]+)"|null)/g)]
  .map((m) => ({ name: m[1], href: m[2] }))
  .filter((p) => p.href);

const manifestFile = path.join(out, "manifest.json");
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : {};

async function appStore(p) {
  const id = p.href.match(/id(\d+)/)?.[1];
  const country = p.href.match(/apple\.com\/([a-z]{2})\//)?.[1] ?? "us";
  const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&country=${country}`);
  const small = (await res.json()).results?.[0]?.screenshotUrls?.[0];
  if (!small) throw new Error("no App Store screenshot found");
  // The listing returns a thumbnail size; ask the image server for a larger one.
  const url = small.replace(/\/\d+x\d+bb\./, "/600x1300bb.");
  const ext = url.toLowerCase().includes(".png") ? "png" : "jpg";
  const img = await fetch(url);
  fs.writeFileSync(path.join(out, `${slug(p.name)}.${ext}`), Buffer.from(await img.arrayBuffer()));
  return { file: `${slug(p.name)}.${ext}`, kind: "phone" };
}

async function web(p, browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(p.href, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(out, `${slug(p.name)}.jpg`), type: "jpeg", quality: 82 });
  } finally {
    await page.close();
  }
  return { file: `${slug(p.name)}.jpg`, kind: "web" };
}

const browser = await chromium.launch();
for (const p of projects) {
  try {
    manifest[slug(p.name)] = p.href.includes("apps.apple.com") ? await appStore(p) : await web(p, browser);
    console.log("ok  ", p.name);
  } catch (e) {
    console.log("skip", p.name, "-", e.message);
  }
}
await browser.close();
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
