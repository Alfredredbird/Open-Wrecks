import { useEffect, useState } from "react";

export default function useShips(API_BASE) {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/ships`)
      .then(res => res.json())
      .then(setShips)
      .catch(err => console.error("Failed to fetch ships:", err));
  }, [API_BASE]);

  return ships;
}
