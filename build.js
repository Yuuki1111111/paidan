import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of [
  "index.html",
  "landing.css",
  "landing.js",
  "site-content.js",
  "privacy.html",
  "styles.css",
  "app.js",
  "app/index.html",
  "assets/wechat-qr.jpg",
  "assets/alipay-qr.jpg",
]) {
  const target = join(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(root, file), target);
}

const envConfig = {
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
};

writeFileSync(
  join(dist, "env.js"),
  `window.APP_CONFIG = ${JSON.stringify(envConfig, null, 2)};\n`,
  "utf8",
);

if (existsSync(join(root, "env.js"))) {
  const sourceEnv = readFileSync(join(root, "env.js"), "utf8");
  if (!envConfig.SUPABASE_URL && !envConfig.SUPABASE_ANON_KEY) {
    writeFileSync(join(dist, "env.js"), sourceEnv, "utf8");
  }
}
