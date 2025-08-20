/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "template2",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
      providers: {
        cloudflare: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
          apiToken: process.env.CLOUDFLARE_API_TOKEN,
        },
      },
    };
  },
  async run() {
    const outputs = {};
    const { readdirSync } = await import("fs");
    for (const value of readdirSync("./infra/")) {
      const result = await import("./infra/" + value);
      if (result.outputs) Object.assign(outputs, result.outputs);
    }
  },
});
