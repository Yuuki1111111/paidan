import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

function parseDotenv(source) {
  const result = {};
  source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line || line.startsWith("#")) return;
      const eqIndex = line.indexOf("=");
      if (eqIndex <= 0) return;
      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    });
  return result;
}

const localEnv = existsSync(join(root, ".env.local"))
  ? parseDotenv(readFileSync(join(root, ".env.local"), "utf8"))
  : {};

function readEnv(key) {
  return process.env[key] || process.env[`VITE_${key}`] || localEnv[key] || localEnv[`VITE_${key}`] || "";
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of [
  "index.html",
  "landing.css",
  "landing.js",
  "site-content.js",
  "privacy.html",
  "support.html",
  "styles.css",
  "app.js",
  "runtime.js",
  "assets/afdian-poster.jpeg",
  "app/index.html",
  "assets/wechat-qr.jpg",
  "assets/alipay-qr.jpg",
  "shared/cloud.js",
  "shared/constants.js",
  "shared/format.js",
  "shared/orders.js",
  "shared/storage.js",
  "mobile/index.html",
  "mobile/mobile.css",
  "mobile/mobile.js",
]) {
  const target = join(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(root, file), target);
}

const envConfig = {
  SUPABASE_URL: readEnv("SUPABASE_URL"),
  SUPABASE_ANON_KEY: readEnv("SUPABASE_ANON_KEY"),
  TURNSTILE_SITE_KEY: readEnv("TURNSTILE_SITE_KEY"),
  AUTH_REDIRECT_URL: readEnv("AUTH_REDIRECT_URL"),
  SUPPORT_URL: readEnv("SUPPORT_URL"),
  APP_TARGET: readEnv("APP_TARGET"),
};

writeFileSync(
  join(dist, "env.js"),
  `window.APP_CONFIG = ${JSON.stringify(envConfig, null, 2)};\n`,
  "utf8",
);

if (existsSync(join(root, "env.js"))) {
  const sourceEnv = readFileSync(join(root, "env.js"), "utf8");
  if (
    !envConfig.SUPABASE_URL &&
    !envConfig.SUPABASE_ANON_KEY &&
    !envConfig.TURNSTILE_SITE_KEY &&
    !envConfig.AUTH_REDIRECT_URL &&
    !envConfig.SUPPORT_URL &&
    !envConfig.APP_TARGET
  ) {
    writeFileSync(join(dist, "env.js"), sourceEnv, "utf8");
  }
}
