import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

// Simple test component to verify imports work
export default function App() {
  return <div className="min-h-screen w-screen bg-sand-25">Hello</div>;
}
