import { db } from "./db";

export const api = new sst.aws.Function("MyApi", {
  url: true,
  handler: "packages/src/api.handler",
  link: [db],
});
