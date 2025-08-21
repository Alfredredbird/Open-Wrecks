// src/components/LoginWidget.jsx
import React from "react";

export default function LoginWidget({ loginData, setLoginData, handleLogin, setShowLogin, message }) {
  return (
    <div className="overlay-widget">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={loginData.username}
        onChange={(e) =>
          setLoginData({ ...loginData, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        value={loginData.password}
        onChange={(e) =>
          setLoginData({ ...loginData, password: e.target.value })
        }
      />
      <button onClick={handleLogin}>Submit</button>
      <button onClick={() => setShowLogin(false)}>Close</button>
      {message && <p>{message}</p>}
    </div>
  );
}
