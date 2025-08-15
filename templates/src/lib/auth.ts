import { db } from "@/db/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import * as schema from "@/db/schema";

// Initialize Polar client
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  // Use 'sandbox' for development, 'production' for live
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID!, // ID of Product from Polar Dashboard
              slug: "pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
            },
            // Add more products as needed
            // {
            //   productId: "another-product-id",
            //   slug: "premium"
            // }
          ],
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(), // Customer portal for managing subscriptions
        usage(), // Usage tracking for metered billing
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          // Customer state changes (subscription status, etc.)
          onCustomerStateChanged: async (payload) => {
            console.log("Customer state changed:", payload);
            // Handle customer state changes here
            // e.g., update user permissions, send notifications
          },
          // Order paid events (purchases, renewals, etc.)
          onOrderPaid: async (payload) => {
            console.log("Order paid:", payload);
            // Handle successful payments here
            // e.g., activate features, send confirmation emails
          },
          // Subscription events
          onSubscriptionCreated: async (payload) => {
            console.log("Subscription created:", payload);
            // Handle new subscriptions
          },
          onSubscriptionCanceled: async (payload) => {
            console.log("Subscription canceled:", payload);
            // Handle subscription cancellations
          },
          onSubscriptionUpdated: async (payload) => {
            console.log("Subscription updated:", payload);
            // Handle subscription updates
          },
          // Catch-all for all events
          onPayload: async (payload) => {
            console.log("Webhook received:", payload.type, payload);
            // Handle any webhook event not covered by specific handlers
          },
        }),
      ],
    }),
    reactStartCookies(), // Keep this as the last plugin in the array
  ],
});
