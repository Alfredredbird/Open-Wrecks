import React, { useState, useEffect } from "react";
import "../App.css";

function SidebarCarousel({ ships, onShipClick }) {
  const shipsWithImages = (ships || [])
    .filter((s) => s.images && s.images[0])
    .slice(0, 6);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shipsWithImages.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % shipsWithImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [shipsWithImages.length]);

  if (shipsWithImages.length === 0) return <p>No ships available</p>;

  const ship = shipsWithImages[index];

  return (
    <div className="sidebar-carousel">
      <h2>Latest Ships</h2>

      <div
        className="widget"
        onClick={() => onShipClick(ship)}
        style={{
          flexDirection: "column",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <h4 style={{ marginBottom: "6px" }}>{ship.title}</h4>
        <div className="widget-divider"></div> {/* separator line */}
        <img
          src={ship.images[0]}
          alt={ship.title}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "300px",
            objectFit: "cover",
            borderRadius: "6px",
            marginTop: "6px",
          }}
        />
      </div>

      <div className="carousel-indicator">
        {index + 1}/{shipsWithImages.length}
      </div>
    </div>
  );
}

export default SidebarCarousel;
