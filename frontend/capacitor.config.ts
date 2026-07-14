import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.schoolmanagement.app",
  appName: "SMS",
  webDir: "dist-mobile",
  server: {
    androidScheme: "https",
  },
};

export default config;
