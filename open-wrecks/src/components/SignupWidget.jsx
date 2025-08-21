// src/components/SignupWidget.jsx
import React from "react";

export default function SignupWidget({ signupData, setSignupData, handleSignup, setShowSignup, message }) {
  return (
    <div className="overlay-widget">
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="Username"
        value={signupData.username}
        onChange={(e) =>
          setSignupData({ ...signupData, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        value={signupData.password}
        onChange={(e) =>
          setSignupData({ ...signupData, password: e.target.value })
        }
      />
      <input
        type="email"
        placeholder="Email"
        value={signupData.email}
        onChange={(e) =>
          setSignupData({ ...signupData, email: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Name"
        value={signupData.name}
        onChange={(e) =>
          setSignupData({ ...signupData, name: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Country"
        value={signupData.country}
        onChange={(e) =>
          setSignupData({ ...signupData, country: e.target.value })
        }
      />
      <button onClick={handleSignup}>Submit</button>
      <button onClick={() => setShowSignup(false)}>Close</button>
      {message && <p>{message}</p>}
    </div>
  );
}
