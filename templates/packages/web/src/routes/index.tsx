import { useAuth } from "@/components/AuthContext";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  const [status, setStatus] = useState("");

  console.log(import.meta.env.VITE_AUTH_URL);
  async function callApi() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}me`, {
      headers: {
        Authorization: `Bearer ${await auth.getToken()}`,
      },
    });

    setStatus(res.ok ? "success" : "error");
  }

  return !auth.loaded ? (
    <div>Loading...</div>
  ) : (
    <div>
      {auth.loggedIn ? (
        <div>
          <p>
            <span>Logged in</span>
            {auth.userId && <span> as {auth.userId}</span>}
          </p>
          {status !== "" && <p>API call: {status}</p>}
          <button onClick={callApi}>Call API</button>
          <button onClick={auth.logout}>Logout</button>
        </div>
      ) : (
        <button onClick={auth.login}>Login with OAuth</button>
      )}
    </div>
  );
}
