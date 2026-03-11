const cfg = globalThis.APP_CONFIG || {};

export const APP_RUNTIME = {
  supabaseUrl: cfg.SUPABASE_URL || "",
  supabaseAnonKey: cfg.SUPABASE_ANON_KEY || "",
  turnstileSiteKey: cfg.TURNSTILE_SITE_KEY || "",
  authRedirectUrl: cfg.AUTH_REDIRECT_URL || "",
  supportUrl: cfg.SUPPORT_URL || "",
  isNativeApp: false,
  platform: "web",
  target: "web",
  isAppStoreBuild: false,
  shouldRegisterServiceWorker: true,
  shouldShowSponsorUi: true,
  defaultStorageMode: "",
};

export function getAuthRedirectUrl(currentUrl) {
  return APP_RUNTIME.authRedirectUrl || currentUrl;
}
