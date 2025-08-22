import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUserID } from "@/lib/auth-server-func";

export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: async () => {
    const userID = await getUserID();
    return {
      userID,
    };
  },
  loader: async ({ context }) => {
    if (!context.userID) {
      throw redirect({ to: "/auth/login" });
    }
    return {
      userID: context.userID,
    };
  },
});

// Simple test component to verify imports work
export default function App() {
  return <div className="min-h-screen w-screen bg-sand-25">Hello</div>;
}
