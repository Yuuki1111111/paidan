const cfg = globalThis.APP_CONFIG || {};
const capacitor = globalThis.Capacitor || null;
const detectedPlatform =
  typeof capacitor?.getPlatform === "function"
    ? capacitor.getPlatform()
    : typeof capacitor?.platform === "string"
      ? capacitor.platform
      : "web";
const isNativeApp =
  typeof capacitor?.isNativePlatform === "function"
    ? capacitor.isNativePlatform()
    : detectedPlatform !== "web";

export const APP_RUNTIME = {
  supabaseUrl: cfg.SUPABASE_URL || "",
  supabaseAnonKey: cfg.SUPABASE_ANON_KEY || "",
  turnstileSiteKey: cfg.TURNSTILE_SITE_KEY || "",
  authRedirectUrl: cfg.AUTH_REDIRECT_URL || "",
  supportUrl: cfg.SUPPORT_URL || "",
  isNativeApp,
  platform: detectedPlatform,
  target: isNativeApp ? "native" : "web",
  isAppStoreBuild: isNativeApp,
  shouldRegisterServiceWorker: !isNativeApp,
  shouldShowSponsorUi: true,
  defaultStorageMode: "",
};

export function getAuthRedirectUrl(currentUrl) {
  return APP_RUNTIME.authRedirectUrl || currentUrl;
}
