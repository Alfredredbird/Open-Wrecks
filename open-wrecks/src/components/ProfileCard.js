import React from "react";
import Widget from "./Widget";
import "./ProfileCard.css";

export default function ProfileCard({ account, onClose }) {
  if (!account) return null;

  return (
    <div className="profile-card-wrapper">
      <div className="profile-card">
        <button className="close-btn" onClick={onClose}>×</button>

        {/* Profile Picture Widget */}
        <div className="profile-widget">
          <Widget
            title=""
            description=""
            icon={account.avatar || "/default-avatar.png"}
          />
        </div>

        <h2>{account.name || account.username}</h2>
        <h4>@{account.username}</h4>
        {account.bio && <p className="bio">{account.bio}</p>}

        <div className="profile-stats">
          <div><strong>Likes:</strong> {account.likes || 0}</div>
          <div><strong>Favorite Ships:</strong> {account.favoriteShips?.length || 0}</div>
        </div>

        {account.favoriteShips && account.favoriteShips.length > 0 && (
          <div className="favorite-ships">
            <h4>Favorite Ships</h4>
            <ul>
              {account.favoriteShips.map((ship, i) => <li key={i}>{ship}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
