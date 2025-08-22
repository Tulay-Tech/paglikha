import { useAuth } from "@/components/AuthContext";
import { useState } from "react";

function App() {
  const auth = useAuth();
  const [status, setStatus] = useState("");

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

export default App;
