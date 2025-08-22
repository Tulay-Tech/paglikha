import { api } from "./api";
import { auth } from "./auth";

const app = new sst.cloudflare.StaticSite("MyWeb", {
  path: "packages/web",
  build: {
    command: "bun run build",
    output: "dist",
  },
  environment: {
    VITE_API_URL: api.url.apply((url) => url || ""),
    VITE_AUTH_URL: auth.url.apply((url) => url || ""),
  },
});
