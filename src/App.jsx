import React, { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get the user_id from the URL query params after redirect
    const queryParams = new URLSearchParams(window.location.search);
    const userId = queryParams.get("user_id");

    if (userId) {
      // Fetch the user data from the backend
      fetch(`http://localhost:8080/api/github/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
        })
        .catch((err) => console.error("Error fetching user:", err));

      // Clean up the URL (remove query params)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:8080/auth/github";
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      <h1>GitHub OAuth with PostgreSQL Demo</h1>
      {user ? (
        <div>
          <p>Welcome, {user.login}!</p>
          <img src={user.avatar_url} alt="Avatar" width="100" />
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Login with GitHub</button>
        </div>
      )}
    </div>
  );
}

export default App;