import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const configPath = join(root, "ios", "App", "App", "capacitor.config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const packageClassList = Array.isArray(config.packageClassList) ? config.packageClassList : [];

if (!packageClassList.includes("StoreKitPlugin")) {
  packageClassList.push("StoreKitPlugin");
}

config.packageClassList = packageClassList;
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
