import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of ["index.html", "styles.css", "app.js"]) {
  copyFileSync(join(root, file), join(dist, file));
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
