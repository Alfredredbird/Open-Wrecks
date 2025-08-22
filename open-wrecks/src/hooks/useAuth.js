import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";

export default function useAuth(API_BASE) {
  const [account, setAccount] = useState(null);

  // wrap validateSession in useCallback so eslint doesn't complain
  const validateSession = useCallback((session) => {
    fetch(`${API_BASE}/api/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setAccount(data);
        else Cookies.remove("session");
      })
      .catch(() => Cookies.remove("session"));
  }, [API_BASE]);

  useEffect(() => {
    const session = Cookies.get("session");
    if (session) validateSession(session);
  }, [validateSession]);

  const logout = () => {
    Cookies.remove("session");
    setAccount(null);
  };

  // expose everything App.js needs
  return { account, setAccount, validateSession, logout };
}
