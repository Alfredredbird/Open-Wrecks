import React, { useState, useEffect } from "react";
import Cookies from "js-cookie"; // <--- import
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import ReactMarkdown from "react-markdown";
import "leaflet/dist/leaflet.css";
import "./App.css";
import L from 'leaflet';

// FlyToPosition helper
function FlyToPosition({ position, zoom }) {
  const map = useMap();
  if (position) map.flyTo(position, zoom, { duration: 1.5 });
  return null;
}

function ImageCarousel({ images }) {
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


function App() {
  const [ships, setShips] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [flyPosition, setFlyPosition] = useState(null);
  const [notification, setNotification] = useState("");
  const [showProfileCard, setShowProfileCard] = useState(false);

  // Widgets
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [pendingShips, setPendingShips] = useState([]); // NEW
  const [showPending, setShowPending] = useState(false); // NEW

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    country: "",
  });
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitData, setSubmitData] = useState({
  title: "",
  lat: "",
  lng: "",
  imo: "",
  description: "",
  images: "",
  links: ""
});

  const boatIcon = new L.Icon({
  iconUrl: 'boat.png', // Make sure to update the path to your boat image
  iconSize: [32, 32],  // Size of the icon (you can adjust this)
  iconAnchor: [16, 32], // Anchor of the icon
  popupAnchor: [0, -32], // Popup position
});

  const [message, setMessage] = useState("");

  // Account info
  const [account, setAccount] = useState(null);

  // Fetch ships
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/ships")
      .then((res) => res.json())
      .then((data) => setShips(data))
      .catch((err) => console.error("Failed to fetch ships:", err));
  }, []);
  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => setMessage(""), 5000); // hide after 5s
    return () => clearTimeout(timer);
  }
}, [message]);

  // Check cookies on load
  useEffect(() => {
    const session = Cookies.get("session");
    if (session) validateSession(session);
  }, []);

  const validateSession = (session) => {
    fetch("http://127.0.0.1:5000/api/account", {
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
  };

  const filteredShips = ships.filter((ship) =>
    ship.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAccount = () => {
  const session = Cookies.get("session");
  if (!session) return setMessage("No session found.");

  if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
    fetch(`http://127.0.0.1:5000/api/delete_account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session })
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message || data.error);
        if (!data.error) handleLogout();
      })
      .catch(err => setMessage("Failed to delete account: " + err));
  }
};

const fetchPending = () => {
    fetch("http://127.0.0.1:5000/api/pending")
      .then(res => res.json())
      .then(data => setPendingShips(data))
      .catch(err => console.error("Failed to fetch pending:", err));
  };

const handleContactSupport = () => {
  window.location.href = "we got no email. go to the github page";
};


  const handleShipClick = (ship) => setFlyPosition([ship.lat, ship.lng]);
  const handleSubmitShip = () => {
  const session = Cookies.get("session");
  if (!session) {
    setMessage("You must be logged in to submit.");
    return;
  }

  // Prepare data
  const payload = {
    session,
    ...submitData,
    images: submitData.images.split(",").map(i => i.trim()),
    links: submitData.links.split(",").map(l => l.trim())
  };

  fetch("http://127.0.0.1:5000/api/pending", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        // Success notification
        setMessage("Ship submitted for review. It will be on the map if approved.");
        setShowSubmit(false);
        setSubmitData({
          title: "",
          lat: "",
          lng: "",
          description: "",
          images: "",
          links: "",
          imo: ""
        });
      } else {
        // Show error from backend
        setMessage(data.error);
      }
    })
    .catch(err => setMessage("Failed to submit: " + err));
};


  const handleLogin = () => {
    fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.session) {
          Cookies.set("session", data.session);
          validateSession(data.session);
          setShowLogin(false);
        }
        setMessage(data.message || data.error);
      });
  };

  const handleSignup = () => {
    fetch("http://127.0.0.1:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || data.error);
        if (data.id) setShowSignup(false);
      });
  };

  const handleLogout = () => {
    Cookies.remove("session");
    setAccount(null);
  };

  return (
    <div className="app-wrapper">
      {message && <div className="notification">{message}</div>}

      {/* Topbar */}
      <div className="topbar">
        <h1>Open-Wrecks</h1>
        <input
          type="text"
          placeholder="Search ships..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        
        
      </div>

      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2>Latest Ships</h2>
          {filteredShips.map((ship) => (
            <div
              key={ship.id}
              className="ship-widget"
              onClick={() => handleShipClick(ship)}
            >
              <h3>{ship.title}</h3>
              {ship.images && ship.images[0] && (
                <img
                  src={ship.images[0]}
                  alt={ship.title}
                  className="ship-widget-img"
                />
              )}
            </div>
          ))}

          {!account && (
            <div className="buttons">
              <button onClick={() => setShowLogin(true)}>Login</button>
              <button onClick={() => setShowSignup(true)}>Signup</button>
            </div>
          )}
           {/* ADMIN BUTTON */}
          {account?.admin && (
            <button
              style={{ marginTop: "20px", background: "darkred", color: "white" }}
              onClick={() => {
                fetchPending();
                setShowPending(true);
              }}
            >
              Review Pending Ships
            </button>
          )}
        </div>

        {/* Map */}
        <div className="map-container">
          <MapContainer
            center={ships.length ? [ships[0].lat, ships[0].lng] : [0, 0]}
            zoom={3}
            minZoom={2}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {flyPosition && <FlyToPosition position={flyPosition} zoom={6} />}
            {ships.map((ship) => (
              <Marker key={ship.id} position={[ship.lat, ship.lng]} icon={boatIcon}>
                <Popup>
                  <h3>{ship.title}</h3>
                  {ship.images && ship.images.length > 0 && (
  <ImageCarousel images={ship.images} />
)}

                  {ship.description && (
                    <div style={{ marginTop: "10px" }}>
                      <ReactMarkdown>{ship.description}</ReactMarkdown>
                    </div>
                  )}
                  {ship.links && (
                    <div style={{ marginTop: "10px" }}>
                      {ship.links.map((link, i) => (
                        <div key={i}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {account && (
  <div className="bottom-left-buttons">
    <span>Welcome {account.username}</span>
     <button onClick={() => setShowSubmit(true)}>Submit Shipwreck</button>
    <button onClick={handleLogout}>Logout</button>
  </div>
)}
{account && (
  <div className="bottom-left-buttons">
    <span>Welcome {account.username}</span>
    <button onClick={() => setShowSubmit(true)}>Submit Shipwreck</button>
    <button onClick={() => setShowProfileCard(!showProfileCard)}>Profile</button>
    <button onClick={handleLogout}>Logout</button>

    {/* Profile Card */}
    {showProfileCard && (
      <div className="profile-card">
        <h3>{account.username}'s Profile</h3>
        <button onClick={handleDeleteAccount}>Delete Account</button>
        <button onClick={handleContactSupport}>Contact Support</button>
      </div>
    )}
  </div>
)}


        </div>
      </div>
      {showPending && account?.admin && (
  <div className="overlay-widget">
    <h2>Pending Ships</h2>
    {pendingShips.length === 0 ? (
      <p>No pending ships.</p>
    ) : (
      pendingShips.map((ship) => (
  <div key={ship.id} className="pending-ship-card">
    <h3>{ship.title || "Untitled"}</h3>
    <p><strong>ID:</strong> {ship.id}</p>
    <p><strong>Submitted By:</strong> {ship.submitted_by}</p>
    <p><strong>IMO:</strong> {ship.imo}</p>
    <p><strong>Coordinates:</strong> {ship.lat}, {ship.lng}</p>
    <p><strong>Bio:</strong></p>
    {/* Description */}
    {ship.description && <ReactMarkdown>{ship.description}</ReactMarkdown>}

    {/* Links */}
    <p><strong>Links:</strong></p>
    {ship.links?.length > 0 && (
      <ul>
        {ship.links.map((link, i) =>
          link ? (
            <li key={i}>
              <a href={link} target="_blank" rel="noreferrer">{link}</a>
            </li>
          ) : null
        )}
      </ul>
    )}

    {/* Approve/Reject buttons */}
    <div style={{ marginTop: "10px" }}>
      <button
        style={{ background: "green", color: "white", marginRight: "10px" }}
        onClick={async () => {
  const session = Cookies.get("session"); 
  await fetch(`http://127.0.0.1:5000/api/approve/${ship.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session }),
  });
  fetchPending(); // refresh list
}}

      >
        Approve
      </button>
      <button
        style={{ background: "darkred", color: "white" }}
        onClick={async () => {
  const session = Cookies.get("session"); 
  await fetch(`http://127.0.0.1:5000/api/reject/${ship.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session }),
  });
  fetchPending();
}}

      >
        Reject
      </button>
    </div>
  </div>
))

    )}
    <button onClick={() => setShowPending(false)}>Close</button>
  </div>
)}

      {/* Login Widget */}
      {showLogin && !account && (
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
      )}
{showSubmit && (
  <div className="overlay-widget">
    <h2>Submit Shipwreck</h2>
    <input
      type="text"
      placeholder="Title"
      value={submitData.title}
      onChange={(e) => setSubmitData({...submitData, title: e.target.value})}
    />
    <input
      type="text"
      placeholder="Latitude"
      value={submitData.lat}
      onChange={(e) => setSubmitData({...submitData, lat: e.target.value})}
    />
    <input
      type="text"
      placeholder="Longitude"
      value={submitData.lng}
      onChange={(e) => setSubmitData({...submitData, lng: e.target.value})}
    />
    <input
      type="text"
      placeholder="IMO Number (if any)"
      value={submitData.imo}
      onChange={(e) => setSubmitData({...submitData, imo: e.target.value})}
    />
    <textarea
      placeholder="Description (Markdown)"
      value={submitData.description}
      onChange={(e) => setSubmitData({...submitData, description: e.target.value})}
    />
    <input
      type="text"
      placeholder="Images (comma separated URLs)"
      value={submitData.images}
      onChange={(e) => setSubmitData({...submitData, images: e.target.value})}
    />
    <input
      type="text"
      placeholder="Links (comma separated URLs)"
      value={submitData.links}
      onChange={(e) => setSubmitData({...submitData, links: e.target.value})}
    />
    <button onClick={handleSubmitShip}>Submit</button>
    <button onClick={() => setShowSubmit(false)}>Close</button>
    {message && <p>{message}</p>}
  </div>
)}

      {/* Signup Widget */}
      {showSignup && !account && (
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
      )}
    </div>
  );
}

export default App;
