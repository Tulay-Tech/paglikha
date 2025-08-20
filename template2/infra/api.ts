import { auth } from "./auth";

export const api = new sst.aws.Function("MyApi", {
  url: true,
  link: [auth],
  handler: "packages/src/api.handler",
});
