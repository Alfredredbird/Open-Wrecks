import React, { useState } from "react";

export default function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;
  if (images.length === 1) return <img src={images[0]} alt="Ship" style={{ width: "100%" }} />;

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="carousel">
      <img src={images[current]} alt={`Ship ${current + 1}`} style={{ width: "100%" }} />
      <div className="carousel-controls">
        <button onClick={prev}>&lt;</button>
        <span>{current + 1}/{images.length}</span>
        <button onClick={next}>&gt;</button>
      </div>
    </div>
  );
}
