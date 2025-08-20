import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip, Polyline } from "react-leaflet";
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
const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;
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

function getDistance(coord1, coord2) {
  const R = 6371; // km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const lat1 = coord1[0] * Math.PI / 180;
  const lat2 = coord2[0] * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) *
    Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getTotalDistance(coords) {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += getDistance(coords[i - 1], coords[i]);
  }
  return total;
}



function App() {
  const [ships, setShips] = useState([]);
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
  // maps
 const mapStyles = {
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  osmHot: {
  name: "OpenStreetMap HOT",
  url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
},
  cartoLight: {
    name: "Carto Light",
    url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  },
  cartoDark: {
    name: "Carto Dark",
    url: "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  },
  stamenToner: {
    name: "Stamen Toner",
    url: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> © <a href="https://stamen.com/" target="_blank">Stamen Design</a> © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
  },
  stamenWatercolor: {
    name: "Stamen Watercolor",
    url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
    attribution: '© <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> © <a href="https://stamen.com/" target="_blank">Stamen Design</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
  },
  stamenTerrain: {
    name: "Stamen Terrain",
    url: "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> © <a href="https://stamen.com/" target="_blank">Stamen Design</a> © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
  }
};

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
  description: "",
  images: "",
  links: ""
});

  const boatIcon = new L.Icon({
  iconUrl: 'boat.png',
  iconSize: [32, 32], 
  iconAnchor: [16, 32], 
  popupAnchor: [0, -32],
});

  const junkyardIcon = L.icon({
  iconUrl: "warning.png", 
  iconSize: [32, 32],             
  iconAnchor: [16, 32],           
  popupAnchor: [0, -32]           
});

  const [message, setMessage] = useState("");

  // Account info
  const [account, setAccount] = useState(null);

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
  // Fetch ships
  useEffect(() => {
    fetch(`${API_BASE}/api/ships`)
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
  };

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
        {/* Sidebar */}
        <div className="sidebar">
          <h2>Latest Ships</h2>
          {[...filteredShips]
  .sort((a, b) => b.id - a.id) // sort descending by ID
  .slice(0, 6) // take top 6
  .map((ship) => (
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
  url={mapStyles[mapStyle].url}
  attribution={mapStyles[mapStyle].attribution}
/>

            {flyPosition && <FlyToPosition position={flyPosition} zoom={6} />}
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
    <span>Welcome {account.username}</span>
     <button onClick={() => setShowSubmit(true)}>Submit Shipwreck</button>
    <button onClick={handleLogout}>Logout</button>
  </div>
)}
{account && (
  <div className="bottom-left-buttons">
    <span>Welcome {account.username}</span>
    <button onClick={() => setShowSubmit(true)}>Submit Shipwreck</button>
    <button onClick={() => setShowOptions(!showOptions)}>Options</button> 
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
    {/* Options Sidebar */}
{showOptions && (
  <div className="options-sidebar">
    <h3>Options</h3>
    <button onClick={() => setShowPorts(!showPorts)}>
      {showPorts ? "Hide Junk Yards" : "Show Junk Yards"}
    </button>
    <button onClick={() => setShowCoordinates(!showCoordinates)}>
      {showCoordinates ? "Hide Coordinates" : "Show Coordinates"}
    </button>
    
    <button onClick={() => setShowMarkers(!showMarkers)}>
      {showMarkers ? "Hide Markers" : "Show Markers"}
    </button>
     <button onClick={() => {
      setMeasureMode(!measureMode);
      setSelectedMarkers([]); 
    }}>
      {measureMode ? "Disable Measure" : "Enable Measure"}
    </button>

    {/* Clear Measurements button */}
    {measureMode && (
      <button onClick={() => setSelectedMarkers([])}>
        Clear Measurements
      </button>
    )}
  <h4>Map Style</h4>
<select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)}>
  {Object.keys(mapStyles).map((key) => (
    <option key={key} value={key}>{mapStyles[key].name}</option>
  ))}
</select>

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
