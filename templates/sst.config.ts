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
    const database = new sst.cloudflare.D1("MyDatabase");

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

    const betterAuthToken = new sst.Secret(
      "BetterAuthToken",
      process.env.BETTER_AUTH_SECRET
    );

    const api = new sst.cloudflare.Worker("Hono", {
      url: true,
      link: [
        database,
        databaseId,
        cloudflareAccountId,
        cloudflareApiToken,
        betterAuthToken,
      ],
      handler: "packages/api/src/index.ts",
    });

    const app = new sst.cloudflare.StaticSite("MyWeb", {
      path: "packages/web",
      build: {
        command: "bun run build",
        output: "dist",
      },
      environment: {
        VITE_API_URL: api.url as any,
      },
    });

    return {
      api: api.url,
      app: app.url,
    };
  },
});
