import React from "react";

export default function Sidebar({ ships, account, onLogin, onSignup, onShipClick, onReviewPending }) {
  return (
    <div className="sidebar">
      <h2>Latest Ships</h2>
      {[...ships].sort((a, b) => b.id - a.id).slice(0, 6).map(ship => (
        <div key={ship.id} className="ship-widget" onClick={() => onShipClick(ship)}>
          <h3>{ship.title}</h3>
          {ship.images?.[0] && <img src={ship.images[0]} alt={ship.title} className="ship-widget-img" />}
        </div>
      ))}

      {!account && (
        <div className="buttons">
          <button onClick={onLogin}>Login</button>
          <button onClick={onSignup}>Signup</button>
        </div>
      )}

      {account?.admin && (
        <button
          style={{ marginTop: "20px", background: "darkred", color: "white" }}
          onClick={onReviewPending}
        >
          Review Pending Ships
        </button>
      )}
    </div>
  );
}
