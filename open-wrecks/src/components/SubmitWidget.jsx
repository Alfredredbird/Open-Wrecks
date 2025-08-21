// src/components/SubmitWidget.jsx
import React from "react";

export default function SubmitWidget({ submitData, setSubmitData, handleSubmitShip, setShowSubmit, message }) {
  return (
    <div className="overlay-widget">
      <h2>Submit Shipwreck</h2>

      <input
        type="text"
        placeholder="Title"
        value={submitData.title}
        onChange={(e) => setSubmitData({ ...submitData, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Latitude or DMS"
        value={submitData.lat}
        onChange={(e) => setSubmitData({ ...submitData, lat: e.target.value })}
      />
      <input
        type="text"
        placeholder="Longitude"
        value={submitData.lng}
        onChange={(e) => setSubmitData({ ...submitData, lng: e.target.value })}
      />
      <input
        type="text"
        placeholder="IMO Number (if any)"
        value={submitData.imo}
        onChange={(e) => setSubmitData({ ...submitData, imo: e.target.value })}
      />
      <input
        type="text"
        placeholder="Date"
        value={submitData.date}
        onChange={(e) => setSubmitData({ ...submitData, date: e.target.value })}
      />
      <input
        type="text"
        placeholder="Owner"
        value={submitData.owner}
        onChange={(e) => setSubmitData({ ...submitData, owner: e.target.value })}
      />
      <input
        type="text"
        placeholder="Port of Registry"
        value={submitData.port_of_registry}
        onChange={(e) =>
          setSubmitData({ ...submitData, port_of_registry: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Type"
        value={submitData.type}
        onChange={(e) => setSubmitData({ ...submitData, type: e.target.value })}
      />
      <input
        type="text"
        placeholder="Tonnage"
        value={submitData.tonnage}
        onChange={(e) =>
          setSubmitData({ ...submitData, tonnage: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Draught (meters)"
        value={submitData.draught}
        onChange={(e) =>
          setSubmitData({ ...submitData, draught: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Length (meters)"
        value={submitData.length}
        onChange={(e) =>
          setSubmitData({ ...submitData, length: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Beam (meters)"
        value={submitData.beam}
        onChange={(e) => setSubmitData({ ...submitData, beam: e.target.value })}
      />
      <input
        type="text"
        placeholder="Capacity"
        value={submitData.capacity}
        onChange={(e) =>
          setSubmitData({ ...submitData, capacity: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Crew"
        value={submitData.crew}
        onChange={(e) => setSubmitData({ ...submitData, crew: e.target.value })}
      />
      <input
        type="text"
        placeholder="Builder"
        value={submitData.builder}
        onChange={(e) =>
          setSubmitData({ ...submitData, builder: e.target.value })
        }
      />

      <textarea
        placeholder="Description (Markdown)"
        value={submitData.description}
        onChange={(e) =>
          setSubmitData({ ...submitData, description: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Images (comma separated URLs)"
        value={submitData.images}
        onChange={(e) =>
          setSubmitData({ ...submitData, images: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Links (comma separated URLs)"
        value={submitData.links}
        onChange={(e) =>
          setSubmitData({ ...submitData, links: e.target.value })
        }
      />

      <button onClick={handleSubmitShip}>Submit</button>
      <button onClick={() => setShowSubmit(false)}>Close</button>
      {message && <p>{message}</p>}
    </div>
  );
}
