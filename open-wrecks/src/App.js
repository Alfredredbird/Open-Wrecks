import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, Polyline } from "react-leaflet";
import ReactMarkdown from "react-markdown";
import "leaflet/dist/leaflet.css";
import "./App.css";
import L from 'leaflet';

import { boatIcon, homeIcon, junkyardIcon } from "./constants/MapIcons";
import { mapStyles } from "./constants/mapStyles";

import FlyToPosition from "./components/FlyToPosition";
import ImageCarousel from "./components/ImageCarousel";
import LoginWidget from "./components/LoginWidget";
import SignupWidget from "./components/SignupWidget";
import SubmitWidget from "./components/SubmitWidget";
import SidebarCarousel from "./components/SidebarCarousel";
import Widget from "./components/Widget"

import useShips from "./hooks/useShips";
import useAuth from "./hooks/useAuth";

import { getDistance, getTotalDistance } from "./helpers/MathComponets";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;


function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [flyPosition, setFlyPosition] = useState(null);
  const [notification, setNotification] = useState("");
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPorts, setShowPorts] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [mapStyle, setMapStyle] = useState("osm"); // default
  const [userLocation, setUserLocation] = useState(null);
  const ships = useShips(API_BASE);
  const [news, setNews] = useState([]);
  // Widgets
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [pendingShips, setPendingShips] = useState([]); 
  const [showPending, setShowPending] = useState(false); 
  // this is really junk yards. idk why i used ports
  const [ports, setPorts] = useState([]);
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
  date: "",
  owner: "",
  port_of_registry: "",
  type: "",
  tonnage: "",
  draught: "",
  length: "",
  beam: "",
  capacity: "",
  crew: "",
  builder: "",
  description: "",
  images: "",
  links: ""
});

  const [message, setMessage] = useState("");

  const { account, logout, setAccount, validateSession } = useAuth(API_BASE);

  // Fetch news on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/news`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNews(data.slice(0, 5)); // latest 5 news items
      })
      .catch(err => console.error("Failed to fetch news:", err));
  }, []);


  // Fetch ports whenever showPorts is toggled on
  useEffect(() => {
  if (showPorts) {
    fetch(`${API_BASE}/api/yards`)
      .then(res => res.json())
      .then(data => setPorts(data))
      .catch(err => console.error("Failed to fetch junk yards:", err));
  } else {
    setPorts([]); // clear ports when hidden
  }
}, [showPorts]);
  
  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => setMessage(""), 5000); // hide after 5s
    return () => clearTimeout(timer);
  }
}, [message]);


  useEffect(() => {
  // Get the ship ID from the URL
  const path = window.location.pathname; // e.g., "/123"
  const shipId = path.replace("/", ""); // "123"

  if (!shipId) return;

  // Wait until ships are loaded
  if (ships.length > 0) {
    const ship = ships.find(s => s.id.toString() === shipId);
    if (ship) {
      setFlyPosition([ship.lat, ship.lng]);
    }
  }
}, [ships]);
  
  

  const filteredShips = ships.filter((ship) =>
    ship.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAccount = () => {
  const session = Cookies.get("session");
  if (!session) return setMessage("No session found.");

  if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
    fetch(`${API_BASE}/api/delete_account`, {
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
    fetch(`${API_BASE}/api/pending`)
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

  fetch(`${API_BASE}/api/pending`, {
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

  const requestUserLocation = () => {
  if (!navigator.geolocation) {
    setMessage("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([latitude, longitude]);
      setFlyPosition([latitude, longitude]); // optional: fly to user
      setMessage("Your location has been found!");
    },
    (error) => {
      setMessage("Unable to retrieve your location: " + error.message);
    }
  );
};


  const handleLogin = () => {
    fetch(`${API_BASE}/api/login`, {
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
    fetch(`${API_BASE}/api/signup`, {
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
         <span className="ship-counter">Logged Ships: {ships.length}</span>
        <input
          type="text"
          placeholder="Search ships..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        
        
      </div>

      <div className="app-container">
{/* Right Sidebar */}
<div className="right-sidebar">
  <h3>Map Tools</h3>

  {/* Ports */}
  <div className="widget" onClick={() => setShowPorts(!showPorts)}>
    <img src="/boat.png" alt="Boat" className="widget-icon" />
    <h4>{showPorts ? "Hide Ports" : "Show Ports"}</h4>
    <p>Toggle port markers on map</p>
  </div>

  {/* Ship Recycle Centers */}
  <div className="widget" onClick={() => alert("Show Ship Recycle Centers triggered")}>
    <img src="/boat.png" alt="Recycle" className="widget-icon" />
    <h4>Show Ship Recycle Centers</h4>
    <p>Display ship recycle centers</p>
  </div>

  {/* Lighthouses */}
  <div className="widget" onClick={() => alert("Show Light Houses triggered")}>
    <img src="/boat.png" alt="Lighthouse" className="widget-icon" />
    <h4>Show Light Houses</h4>
    <p>Display lighthouses on map</p>
  </div>

  {/* Ship Viewer */}
  <div className="widget" onClick={() => (window.location.href = "/viewer")}>
    <img src="/boat.png" alt="Viewer" className="widget-icon" />
    <h4>Ship Wreck Viewer</h4>
    <p>Go to viewer page</p>
  </div>

  <hr />

  <h3>Map Options</h3>

  {/* Show/Hide Markers */}
  <div className="widget" onClick={() => setShowMarkers(!showMarkers)}>
    <img src="/boat.png" alt="Markers" className="widget-icon" />
    <h4>{showMarkers ? "Hide Markers" : "Show Markers"}</h4>
    <p>Toggle all ship markers</p>
  </div>

  {/* Show My Location */}
  <div className="widget" onClick={requestUserLocation}>
    <img src="/boat.png" alt="Location" className="widget-icon" />
    <h4>Show My Location</h4>
    <p>Fly to your current location</p>
  </div>

  {/* Show/Hide Coordinates */}
  <div className="widget" onClick={() => setShowCoordinates(!showCoordinates)}>
    <img src="/boat.png" alt="Coordinates" className="widget-icon" />
    <h4>{showCoordinates ? "Hide Coordinates" : "Show Coordinates"}</h4>
    <p>Display coordinates on markers</p>
  </div>

  {/* Measure Mode */}
  <div className="widget" onClick={() => { setMeasureMode(!measureMode); setSelectedMarkers([]); }}>
    <img src="/boat.png" alt="Measure" className="widget-icon" />
    <h4>{measureMode ? "Disable Measure" : "Enable Measure"}</h4>
    <p>Measure distance between points</p>
  </div>

  {/* Clear Measurements */}
  {measureMode && (
    <div className="widget" onClick={() => setSelectedMarkers([])}>
      <img src="/boat.png" alt="Clear" className="widget-icon" />
      <h4>Clear Measurements</h4>
      <p>Reset measured points</p>
    </div>
  )}

  {/* Map Style */}
  <div className="widget">
    <img src="/boat.png" alt="Map Style" className="widget-icon" />
    <h4>Map Style</h4>
    <select
      value={mapStyle}
      onChange={(e) => setMapStyle(e.target.value)}
      style={{ width: "100%", marginTop: "5px" }}
    >
      {Object.keys(mapStyles).map((key) => (
        <option key={key} value={key}>{mapStyles[key].name}</option>
      ))}
    </select>
    <p>Change map tile style</p>
  </div>
</div>


        {/* Sidebar */}
        <div className="sidebar">
          {/* Welcome Widget */}
  {account && (
    <div className="welcome-widget">
      <Widget
  title={`Welcome ${account.username}!`}
  description=""
  severity="warning"
/>

    </div>
  )}
          <SidebarCarousel
    ships={[...filteredShips].sort((a, b) => b.id - a.id).slice(0, 6)}
    onShipClick={handleShipClick}
  />
         {/* News Section */}
<div className="news-section">
  <h2>Latest News</h2>
  {news.length === 0 && <p>No news available</p>}
  {news.slice(0, 3).map((item, i) => (
    <div key={i} className="news-card">
      <div className="news-header">
        <h4>{item.title}</h4>
        <span className={`news-severity news-${item.severity}`}>
          {item.severity.toUpperCase()}
        </span>
      </div>
      <div className="news-divider"></div>
      {item.image && item.image.trim() !== "" && (
        <img src={item.image} alt={item.title} className="news-img" />
      )}
      {item.summary && <p className="news-summary">{item.summary}</p>}
      {item.link && (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
          Read more
        </a>
      )}
    </div>
  ))}
</div>


 {!account && (
    <div className="buttons">
      <button onClick={() => setShowLogin(true)}>Login</button>
      <button onClick={() => setShowSignup(true)}>Signup</button>
    </div>
  )}

  {/* Admin Section */}
  {account && (
    <div className="admin-section">
      <h2>Account</h2>

      {/* Profile widget for all logged-in users */}
      <div className="widget" onClick={() => setShowProfileCard(!showProfileCard)}>
        <img src="/boat.png" alt="Profile" className="widget-icon" />
        <h4>Profile</h4>
        <p>View your profile information</p>
      </div>
      <div className="widget" onClick={() => alert("Favorites clicked")}>
            <img src="/boat.png" alt="Favorites" className="widget-icon" />
            <h4>Favorites</h4>
            <p>View favorite ships</p>
          </div>
      {/* Submit Shipwreck */}
    <div className="widget" onClick={() => setShowSubmit(true)}>
      <img src="/boat.png" alt="Submit" className="widget-icon" />
      <h4>Submit Shipwreck</h4>
      <p>Submit a new shipwreck for review</p>
    </div>    
      {/* Admin-only widgets */}
      {account.admin && (
        <>
          <div className="widget" onClick={() => { fetchPending(); setShowPending(true); }}>
            <img src="/boat.png" alt="Admin" className="widget-icon" />
            <h4>Submit Ships</h4>
            <p>Approve or reject newly submitted ships</p>
          </div>
        </>
      )}
      <div className="widget" onClick={() => alert("Settings clicked")}>
            <img src="/boat.png" alt="Settings" className="widget-icon" />
            <h4>Settings</h4>
            <p>Change your account settings</p>
      </div>
      <div className="widget" onClick={handleLogout}>
        <img src="/boat.png" alt="Logout" className="widget-icon" />
        <h4>Logout</h4>
        <p>Sign out of your account</p>
    </div>
    </div>
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
  url={mapStyles[mapStyle].url}
  attribution={mapStyles[mapStyle].attribution}
/>

            {flyPosition && <FlyToPosition position={flyPosition} zoom={6} />}
            {userLocation && (
  <Marker position={userLocation} icon={homeIcon}>
    <Popup>
      <strong>You are here!</strong>
    </Popup>
  </Marker>
)}

            {showMarkers &&
  ships.map((ship) => (
    <Marker key={ship.id} position={[ship.lat, ship.lng]} icon={boatIcon}eventHandlers={{
  click: () => {
    if (measureMode) {
      setSelectedMarkers([...selectedMarkers, [ship.lat, ship.lng]]);
    } else {
      handleShipClick(ship);
    }
  }
}}
>
      <Popup>
        <h3>{ship.title}</h3>
        {ship.images && ship.images.length > 0 && <ImageCarousel images={ship.images} />}
        {ship.description && (
          <div style={{ marginTop: "10px" }}>
            <ReactMarkdown>{ship.description}</ReactMarkdown>
          </div>
        )}
        <div style={{ marginTop: "10px" }}>
  {ship.links && ship.links.map((link, i) => (
    <div key={i}>
      <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
    </div>
  ))}
  <div>
    <a
      href={`https://www.google.com/maps?q=${ship.lat},${ship.lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="map-link"
    >
      View on Google Maps
    </a>
  </div>
</div>
 {showCoordinates && (
        <Tooltip permanent direction="bottom" offset={[0, 20]} interactive={false}>
          <span>{ship.lat}, {ship.lng}</span>
        </Tooltip>
      )}
      </Popup>
    </Marker>
  ))
}
        {showPorts && ports.map((port) => (
  <Marker
    key={`port-${port.id}`}
    position={[port.lat, port.lng]}
    icon={junkyardIcon}
    // WONT WORK WITH PORTS YET
//     eventHandlers={{
//   click: () => {
//     if (measureMode) {
//       setSelectedMarkers([...selectedMarkers, [port.lat, [port].lng]]);
//     } else {
//       handleShipClick(port);
//     }
//   }
// }}

  >
    <Popup>
      <h3>{port.name}</h3>
      {port.images && port.images.length > 0 && <ImageCarousel images={port.images} />}
      {port.description && (
        <div style={{ marginTop: "10px" }}>
          <ReactMarkdown>{port.description}</ReactMarkdown>
        </div>
      )}
      <div style={{ marginTop: "10px" }}>
  {port.links && port.links.map((link, i) => (
    <div key={i}>
      <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
    </div>
  ))}
  <div>
    <a
      href={`https://www.google.com/maps?q=${port.lat},${port.lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="map-link"
    >
      View on Google Maps
    </a>
  </div>
</div>
     {showCoordinates && (
        <Tooltip permanent direction="bottom" offset={[0, 20]} interactive={false}>
          <span>{port.lat}, {port.lng}</span>
        </Tooltip>
      )}
    </Popup>
  </Marker>
))}
{selectedMarkers.length >= 2 && (
  <>
    {/* Draw the main polyline */}
    <Polyline positions={selectedMarkers} color="red" />

    {/* Draw a tiny Polyline for each segment just to attach Tooltip */}
    {selectedMarkers.map((coord, i) => {
      if (i === 0) return null;

      const lat1 = selectedMarkers[i - 1][0];
      const lng1 = selectedMarkers[i - 1][1];
      const lat2 = coord[0];
      const lng2 = coord[1];

      const dist = getDistance([lat1, lng1], [lat2, lng2]).toFixed(2);

      // midpoint
      const midLat = (lat1 + lat2) / 2;
      const midLng = (lng1 + lng2) / 2;

      return (
        <Polyline
          key={i}
          positions={[[lat1, lng1], [lat2, lng2]]}
          color="transparent"
        >
          <Tooltip
            permanent
            direction="center"
            offset={[0, 0]}
            interactive={false}
            opacity={1}
            sticky={false}
            className="distance-tooltip"
          >
            <span>{dist} km</span>
          </Tooltip>
        </Polyline>
      );
    })}

    {/* Optional: total distance at last point */}
    <Marker position={selectedMarkers[selectedMarkers.length - 1]}>
      <Tooltip permanent direction="bottom" offset={[0, 20]}>
        <span>Total: {getTotalDistance(selectedMarkers).toFixed(2)} km</span>
      </Tooltip>
    </Marker>
  </>
)}

          </MapContainer>
          
{account && (
  <div className="bottom-left-buttons">
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
  await fetch(`${API_BASE}/api/approve/${ship.id}`, {
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
  await fetch(`${API_BASE}/api/reject/${ship.id}`, {
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
  <LoginWidget
    loginData={loginData}
    setLoginData={setLoginData}
    handleLogin={handleLogin}
    setShowLogin={setShowLogin}
    message={message}
  />
)}
{/* Submit Widget */}
{showSubmit && (
  <SubmitWidget
    submitData={submitData}
    setSubmitData={setSubmitData}
    handleSubmitShip={handleSubmitShip}
    setShowSubmit={setShowSubmit}
    message={message}
  />
)}

     {/* Signup Widget */}
{showSignup && !account && (
  <SignupWidget
    signupData={signupData}
    setSignupData={setSignupData}
    handleSignup={handleSignup}
    setShowSignup={setShowSignup}
    message={message}
  />
)}
    </div>
  );
}

export default App;
