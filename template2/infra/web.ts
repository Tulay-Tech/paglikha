import { api } from "./api";

export const web = new sst.cloudflare.StaticSite("MyWeb", {
  path: "packages/web",
  build: {
    output: "dist",
    command: "npm run build",
  },
  environment: {
    VITE_API_URL: api.url,
  },
});
