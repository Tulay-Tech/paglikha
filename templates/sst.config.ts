/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "templates",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
    };
  },
  async run() {
    const database = new sst.cloudflare.D1("ProjectDatabase");

    // for Drizzle to connect over HTTP
    const databaseId = database.databaseId.apply(
      (id) => new sst.Secret("ProjectDatabaseId", id)
    );
    const cloudflareAccountId = new sst.Secret(
      "CloudflareAccountId",
      sst.cloudflare.DEFAULT_ACCOUNT_ID
    );
    const cloudflareApiToken = new sst.Secret(
      "CloudflareApiToken",
      process.env.CLOUDFLARE_API_TOKEN
    );

    const kv = new sst.cloudflare.Kv("AuthKV");

    const auth = new sst.cloudflare.Worker("Auth", {
      handler: "packages/auth/issuer.ts",
      link: [kv, database],
      url: true,
    });

    const api = new sst.cloudflare.Worker("Hono", {
      url: true,
      link: [database, databaseId, cloudflareAccountId, cloudflareApiToken],
      handler: "packages/api/src/index.ts",
      environment: {
        WORKERS_AUTH_URL: auth.url as any,
      },
    });

    const app = new sst.cloudflare.StaticSite("MyWeb", {
      path: "packages/web",
      build: {
        command: "bun run build",
        output: "dist",
      },
      environment: {
        VITE_API_URL: api.url as any,
        VITE_AUTH_URL: auth.url as any,
      },
    });

    return {
      api: api.url,
      auth: auth.url,
      app: app.url,
    };
  },
});
