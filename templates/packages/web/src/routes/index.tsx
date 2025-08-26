import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

export default function HomePage() {
  const navigate = useNavigate();

  const { data: session, isPending, error } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/auth/login" });
        },
      },
    });
  };

  // Redirect to login on any error (including 401)
  useEffect(() => {
    if (error) {
      navigate({ to: "/auth/login" });
    }
  }, [error, navigate]);

  if (isPending) return <div>Loading session...</div>;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      {!session ? (
        <button onClick={() => navigate({ to: "/auth/login" })}>Sign in</button>
      ) : (
        <div>
          <p>Hello, {session.user?.email}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
}
