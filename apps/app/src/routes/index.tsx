import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

// Simple test component to verify imports work
export function App() {
  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}
