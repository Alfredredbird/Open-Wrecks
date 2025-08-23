import React, { useState, useEffect } from "react";
import "../App.css";

function SidebarCarousel({ ships, onShipClick }) {
  // Filter down to latest 6 ships with a valid first image
  const shipsWithImages = (ships || [])
    .filter((s) => s.images && s.images[0]) // ensures first image is truthy
    .slice(0, 6);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shipsWithImages.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % shipsWithImages.length);
    }, 4000); // change every 4 seconds

    return () => clearInterval(interval);
  }, [shipsWithImages.length]);

  if (shipsWithImages.length === 0) return <p>No ships available</p>;

  const ship = shipsWithImages[index];

  return (
    <div className="sidebar-carousel">
      <h2>Latest Ships</h2>
      <div
        className="carousel-item"
        onClick={() => onShipClick(ship)}
      >
        <h3>{ship.title}</h3>
        <img
          src={ship.images[0]}
          alt={ship.title}
          className="carousel-img"
        />
      </div>
      <div className="carousel-indicator">
        {index + 1}/{shipsWithImages.length}
      </div>
    </div>
  );
}

export default SidebarCarousel;
