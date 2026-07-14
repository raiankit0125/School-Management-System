import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.mobile");
const placeholderHosts = new Set(["my-backend.onrender.com", "your-backend.onrender.com"]);

const fail = (message) => {
  console.error(`\nMobile env error: ${message}\n`);
  process.exit(1);
};

if (!fs.existsSync(envPath)) {
  fail("frontend/.env.mobile is missing. Add VITE_API_URL with your live Render backend URL.");
}

const envText = fs.readFileSync(envPath, "utf8");
const apiLine = envText
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => line && !line.startsWith("#") && line.startsWith("VITE_API_URL="));

if (!apiLine) {
  fail("VITE_API_URL is missing in frontend/.env.mobile.");
}

const apiUrl = apiLine.replace(/^VITE_API_URL=/, "").trim().replace(/^["']|["']$/g, "");

if (!apiUrl) {
  fail("VITE_API_URL is empty in frontend/.env.mobile.");
}

let parsedUrl;
try {
  parsedUrl = new URL(apiUrl);
} catch {
  fail(`VITE_API_URL must be a valid URL. Current value: ${apiUrl}`);
}

if (parsedUrl.protocol !== "https:") {
  fail(`VITE_API_URL must use https for APK builds. Current value: ${apiUrl}`);
}

if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
  fail("VITE_API_URL cannot be localhost for an installed APK. Use your live Render backend URL.");
}

if (placeholderHosts.has(parsedUrl.hostname)) {
  fail("Replace the placeholder VITE_API_URL in frontend/.env.mobile with your real Render backend URL.");
}

console.log(`Mobile API target: ${parsedUrl.origin}`);
