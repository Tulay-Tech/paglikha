import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

import { Builder, Renderer } from "@workspace/renderer";

const samplePage = {
  id: "root",
  type: "div",
  props: {
    className: "min-h-screen bg-gradient-to-b from-blue-50 to-white p-4", // Added padding
  },
  children: [
    // Hero section with title, subtitle, description and CTA buttons
    {
      id: "hero",
      type: "div",
      props: {
        className:
          "text-center py-20 px-6 max-w-4xl mx-auto border border-dashed border-gray-300 rounded-lg mb-8", // Added border for visibility
      },
      children: [
        {
          id: "hero-title",
          type: "h1",
          props: {
            className: "text-6xl font-bold text-gray-900 mb-6",
          },
          children: "DataFlow Pro",
        },
        {
          id: "hero-subtitle",
          type: "p",
          props: {
            className: "text-2xl text-gray-600 mb-4",
          },
          children: "Streamline Your Data Analytics Workflow",
        },
        {
          id: "hero-description",
          type: "p",
          props: {
            className: "text-lg text-gray-500 mb-8 max-w-2xl mx-auto",
          },
          children:
            "Transform raw data into actionable insights with our powerful analytics platform. Connect, analyze, and visualize your data in minutes, not hours.",
        },
        {
          id: "hero-cta-container",
          type: "div",
          props: {
            className:
              "flex gap-4 justify-center p-2 border border-dashed border-gray-200 rounded", // Added padding and border
          },
          children: [
            {
              id: "hero-cta-primary",
              type: "Button",
              props: {
                variant: "default",
                className:
                  "px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white",
              },
              actionId: "startTrial",
              children: "Start Free Trial",
            },
            {
              id: "hero-cta-secondary",
              type: "Button",
              props: {
                variant: "outline",
                className: "px-8 py-4 text-lg border-gray-300 hover:bg-gray-50",
              },
              actionId: "learnMore",
              children: "Watch Demo",
            },
          ],
        },
      ],
    },
    // Features section showcasing key product features
    {
      id: "features-section",
      type: "div",
      props: {
        className:
          "py-20 px-6 bg-white border border-dashed border-gray-300 rounded-lg mb-8", // Added border
      },
      children: [
        {
          id: "features-header",
          type: "div",
          props: {
            className: "text-center mb-16 max-w-3xl mx-auto",
          },
          children: [
            {
              id: "features-title",
              type: "h1",
              props: {
                className: "text-4xl font-bold text-gray-900 mb-4",
              },
              children: "Everything you need to succeed",
            },
            {
              id: "features-description",
              type: "p",
              props: {
                className: "text-xl text-gray-600",
              },
              children:
                "Powerful features designed to help teams work smarter and faster",
            },
          ],
        },
        {
          id: "features-grid",
          type: "div",
          props: {
            className:
              "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto p-2 border border-dashed border-gray-200 rounded", // Added padding and border
          },
          children: [
            {
              id: "feature-1",
              type: "div",
              props: {
                className: "text-center p-8 bg-gray-50 rounded-xl",
              },
              children: [
                {
                  id: "feature-1-title",
                  type: "h1",
                  props: {
                    className: "text-2xl font-semibold text-gray-900 mb-4",
                  },
                  children: "Real-time Analytics",
                },
                {
                  id: "feature-1-desc",
                  type: "p",
                  props: {
                    className: "text-gray-600",
                  },
                  children:
                    "Monitor your data in real-time with live dashboards and instant alerts when metrics change.",
                },
              ],
            },
            {
              id: "feature-2",
              type: "div",
              props: {
                className: "text-center p-8 bg-gray-50 rounded-xl",
              },
              children: [
                {
                  id: "feature-2-title",
                  type: "h1",
                  props: {
                    className: "text-2xl font-semibold text-gray-900 mb-4",
                  },
                  children: "Smart Integrations",
                },
                {
                  id: "feature-2-desc",
                  type: "p",
                  props: {
                    className: "text-gray-600",
                  },
                  children:
                    "Connect to 100+ data sources including databases, APIs, and cloud services seamlessly.",
                },
              ],
            },
            {
              id: "feature-3",
              type: "div",
              props: {
                className: "text-center p-8 bg-gray-50 rounded-xl",
              },
              children: [
                {
                  id: "feature-3-title",
                  type: "h1",
                  props: {
                    className: "text-2xl font-semibold text-gray-900 mb-4",
                  },
                  children: "Advanced Security",
                },
                {
                  id: "feature-3-desc",
                  type: "p",
                  props: {
                    className: "text-gray-600",
                  },
                  children:
                    "Enterprise-grade security with encryption, audit logs, and compliance certifications.",
                },
              ],
            },
          ],
        },
      ],
    },
    // Pricing section with three tiers
    {
      id: "pricing-section",
      type: "div",
      props: {
        className:
          "py-20 px-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg mb-8", // Added border
      },
      children: [
        {
          id: "pricing-header",
          type: "div",
          props: {
            className: "text-center mb-16 max-w-3xl mx-auto",
          },
          children: [
            {
              id: "pricing-title",
              type: "h1",
              props: {
                className: "text-4xl font-bold text-gray-900 mb-4",
              },
              children: "Simple, transparent pricing",
            },
            {
              id: "pricing-description",
              type: "p",
              props: {
                className: "text-xl text-gray-600",
              },
              children: "Choose the plan that fits your team's needs",
            },
          ],
        },
        {
          id: "pricing-grid",
          type: "div",
          props: {
            className:
              "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto p-2 border border-dashed border-gray-200 rounded", // Added padding and border
          },
          children: [
            // Starter pricing tier
            {
              id: "pricing-starter",
              type: "div",
              props: {
                className:
                  "bg-white p-8 rounded-xl shadow-sm border border-gray-200",
              },
              children: [
                {
                  id: "starter-name",
                  type: "h1",
                  props: {
                    className: "text-2xl font-semibold text-gray-900 mb-2",
                  },
                  children: "Starter",
                },
                {
                  id: "starter-price",
                  type: "p",
                  props: {
                    className: "text-4xl font-bold text-gray-900 mb-6",
                  },
                  children: "$29/mo",
                },
                {
                  id: "starter-features",
                  type: "div",
                  props: {
                    className: "space-y-3 mb-8",
                  },
                  children: [
                    {
                      id: "starter-feature-1",
                      type: "p",
                      props: {
                        className: "text-gray-600",
                      },
                      children: "• Up to 5 data sources",
                    },
                    {
                      id: "starter-feature-2",
                      type: "p",
                      props: {
                        className: "text-gray-600",
                      },
                      children: "• 10GB data storage",
                    },
                    {
                      id: "starter-feature-3",
                      type: "p",
                      props: {
                        className: "text-gray-600",
                      },
                      children: "• Basic analytics",
                    },
                  ],
                },
                {
                  id: "starter-cta",
                  type: "Button",
                  props: {
                    variant: "outline",
                    className: "w-full py-3 border-gray-300 hover:bg-gray-50",
                  },
                  actionId: "startTrial",
                  children: "Start Free Trial",
                },
              ],
            },
            // Professional pricing tier (highlighted as most popular)
            {
              id: "pricing-pro",
              type: "div",
              props: {
                className:
                  "bg-blue-600 p-8 rounded-xl shadow-sm text-white relative",
              },
              children: [
                {
                  id: "pro-badge",
                  type: "div",
                  props: {
                    className:
                      "absolute -top-4 left-1/2 transform -translate-x-1/2",
                  },
                  children: [
                    {
                      id: "pro-badge-text",
                      type: "p",
                      props: {
                        className:
                          "bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold",
                      },
                      children: "Most Popular",
                    },
                  ],
                },
                {
                  id: "pro-name",
                  type: "h1",
                  props: {
                    className: "text-2xl font-semibold mb-2",
                  },
                  children: "Professional",
                },
                {
                  id: "pro-price",
                  type: "p",
                  props: {
                    className: "text-4xl font-bold mb-6",
                  },
                  children: "$99/mo",
                },
                {
                  id: "pro-features",
                  type: "div",
                  props: {
                    className: "space-y-3 mb-8",
                  },
                  children: [
                    {
                      id: "pro-feature-1",
                      type: "p",
                      props: {
                        className: "text-blue-100",
                      },
                      children: "• Unlimited data sources",
                    },
                    {
                      id: "pro-feature-2",
                      type: "p",
                      props: {
                        className: "text-blue-100",
                      },
                      children: "• 1TB data storage",
                    },
                    {
                      id: "pro-feature-3",
                      type: "p",
                      props: {
                        className: "text-blue-100",
                      },
                      children: "• Advanced analytics & AI",
                    },
                  ],
                },
                {
                  id: "pro-cta",
                  type: "Button",
                  props: {
                    variant: "default",
                    className:
                      "w-full py-3 bg-white text-blue-600 hover:bg-gray-50",
                  },
                  actionId: "startTrial",
                  children: "Start Free Trial",
                },
              ],
            },
            // Enterprise pricing tier
            {
              id: "pricing-enterprise",
              type: "div",
              props: {
                className:
                  "bg-white p-8 rounded-xl shadow-sm border border-gray-200",
              },
              children: [
                {
                  id: "enterprise-name",
                  type: "h1",
                  props: {
                    className: "text-2xl font-semibold text-gray-900 mb-2",
                  },
                  children: "Enterprise",
                },
                {
                  id: "enterprise-price",
                  type: "p",
                  props: {
                    className: "text-4xl font-bold text-gray-900 mb-6",
                  },
                  children: "Custom",
                },
                {
                  id: "enterprise-features",
                  type: "div",
                  props: {
                    className: "space-y-3 mb-8",
                  },
                  children: [
                    {
                      id: "enterprise-feature-1",
                      type: "p",
                      props: {
                        className: "text-gray-600",
                      },
                      children: "• Custom integrations",
                    },
                    {
                      id: "enterprise-feature-2",
                      type: "p",
                      props: {
                        className: "text-gray-600",
                      },
                      children: "• Dedicated support",
                    },
                    {
                      id: "enterprise-feature-3",
                      type: "p",
                      props: {
                        className: "text-gray-600",
                      },
                      children: "• On-premise deployment",
                    },
                  ],
                },
                {
                  id: "enterprise-cta",
                  type: "Button",
                  props: {
                    variant: "outline",
                    className: "w-full py-3 border-gray-300 hover:bg-gray-50",
                  },
                  actionId: "contactSales",
                  children: "Contact Sales",
                },
              ],
            },
          ],
        },
      ],
    },
    // Final call-to-action section
    {
      id: "cta-section",
      type: "div",
      props: {
        className:
          "py-20 px-6 bg-blue-600 text-white text-center border border-dashed border-gray-300 rounded-lg", // Added border
      },
      children: [
        {
          id: "cta-title",
          type: "h1",
          props: {
            className: "text-4xl font-bold mb-4",
          },
          children: "Ready to transform your data?",
        },
        {
          id: "cta-description",
          type: "p",
          props: {
            className: "text-xl text-blue-100 mb-8 max-w-2xl mx-auto",
          },
          children:
            "Join thousands of companies already using DataFlow Pro to make better decisions faster.",
        },
        {
          id: "cta-button",
          type: "Button",
          props: {
            variant: "default",
            className:
              "px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-50",
          },
          actionId: "startTrial",
          children: "Get Started Today",
        },
      ],
    },
  ],
};

// Simple test component to verify imports work
export function App() {
  return (
    <div>
      <Renderer component={samplePage} />
      <Builder component={samplePage} />
    </div>
  );
}
