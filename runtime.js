const cfg = globalThis.APP_CONFIG || {};
const capacitor = globalThis.Capacitor || null;
const configuredTarget = String(cfg.APP_TARGET || "").trim().toLowerCase();
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
  supportUrl: cfg.SUPPORT_URL || "/support.html",
  termsUrl: cfg.TERMS_URL || "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  privacyUrl: cfg.PRIVACY_URL || "/privacy.html",
  isNativeApp,
  platform: detectedPlatform,
  target: configuredTarget || (isNativeApp ? "native" : "web"),
  isAppStoreBuild: configuredTarget === "appstore-ios" || (isNativeApp && detectedPlatform === "ios"),
  shouldRegisterServiceWorker: !isNativeApp && configuredTarget !== "appstore-ios",
  shouldShowSponsorUi: !(configuredTarget === "appstore-ios" || (isNativeApp && detectedPlatform === "ios")),
  defaultStorageMode: "",
};

export function getAuthRedirectUrl(currentUrl) {
  return APP_RUNTIME.authRedirectUrl || currentUrl;
}
