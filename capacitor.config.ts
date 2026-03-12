import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "me.huale.desk",
  appName: "画了么",
  webDir: "dist",
  ios: {
    contentInset: "automatic",
    allowsLinkPreview: false,
    backgroundColor: "#FAF8F5",
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#FAF8F5",
    },
  },
  server: {
    // In production the app loads from bundled assets.
    // During dev you can uncomment the line below to load from a local server:
    // url: "http://localhost:3000/mobile/",
  },
};

export default config;
