import React, { useState, useEffect } from "react";
import Select from "react-select";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot } from "firebase/firestore";

export default function WorkersAttendanceUserPage({ user }) {
  const [workers, setWorkers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [sites, setSites] = useState([{ clientName: "", location: "", workers: [], vehicles: [] }]);
  const [fabrications, setFabrications] = useState([{ clientName: "", location: "", workers: [] }]);
  const [absent, setAbsent] = useState([]);
  const [utilityWorkers, setUtilityWorkers] = useState([]);
  const [maintenanceCarWorkers, setMaintenanceCarWorkers] = useState([]);
  const [toolRoomWorkers, setToolRoomWorkers] = useState([]);
  const [addOns, setAddOns] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);


  // Fetch workers list from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers_list"), (snap) => {
      setWorkers(snap.docs.map((doc) => doc.data().name));
    });
    return () => unsub();
  }, []);

  // Fetch vehicles list from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "vehicles_list"), (snap) => {
      setVehicles(snap.docs.map((doc) => doc.data().name));
    });
    return () => unsub();
  }, []);

  // Date in Philippines time
  const today = new Date().toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Manila"
  });

  // Check if user already submitted today
  useEffect(() => {
    async function checkSubmitted() {
  const q = query(
    collection(db, "workers_attendance"),
    where("userId", "==", user.uid),
    where("date", "==", today)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    setSubmittedToday(true);
    setSubmittedData(snap.docs[0].data());
  }
}

    checkSubmitted();
    // eslint-disable-next-line
  }, [user.uid, today]);

  // Handlers for dynamic site/fabrication addition
  const addSite = () => setSites([...sites, { clientName: "", location: "", workers: [], vehicles: [] }]);
  const updateSite = (idx, field, value) => {
    const updated = [...sites];
    updated[idx][field] = value;
    setSites(updated);
  };

  const removeSite = (idx) => {
  const updated = [...sites];
  updated.splice(idx, 1);
  setSites(updated);
};

  const addFabrication = () => setFabrications([...fabrications, { clientName: "", location: "", workers: [] }]);
  const updateFabrication = (idx, field, value) => {
    const updated = [...fabrications];
    updated[idx][field] = value;
    setFabrications(updated);
  };

  const removeFabrication = (idx) => {
  const updated = [...fabrications];
  updated.splice(idx, 1);
  setFabrications(updated);
};

  // Get all selected workers in all categories except add-ons
  const getAllSelectedWorkers = (exclude = {}) => {
    let selected = [];
    sites.forEach((site, idx) => {
      if (!(exclude.type === "site" && exclude.idx === idx)) selected = selected.concat(site.workers);
    });
    fabrications.forEach((fab, idx) => {
      if (!(exclude.type === "fab" && exclude.idx === idx)) selected = selected.concat(fab.workers);
    });
    if (!(exclude.type === "absent")) selected = selected.concat(absent);
    if (!(exclude.type === "utility")) selected = selected.concat(utilityWorkers);
    if (!(exclude.type === "maint")) selected = selected.concat(maintenanceCarWorkers);
    if (!(exclude.type === "tool")) selected = selected.concat(toolRoomWorkers);
    return selected;
  };

  // Get all selected vehicles in all sites except current
  const getAllSelectedVehicles = (excludeIdx = -1) => {
    let selected = [];
    sites.forEach((site, idx) => {
      if (idx !== excludeIdx) selected = selected.concat(site.vehicles);
    });
    return selected;
  };
    // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "workers_attendance"), {
        userId: user.uid,
        userEmail: user.email,
        date: today,
        timestamp: serverTimestamp(),
        site: sites,
        fabrications,
        absent,
        utilityWorkers,
        maintenanceCarWorkers,
        toolRoomWorkers,
        addOns
      });
      setSubmittedToday(true);
      setSites([{ clientName: "", location: "", workers: [], vehicles: [] }]);
      setFabrications([{ clientName: "", location: "", workers: [] }]);
      setAbsent([]);
      setUtilityWorkers([]);
      setMaintenanceCarWorkers([]);
      setToolRoomWorkers([]);
      setAddOns("");
    } catch (err) {
      alert("Error submitting attendance: " + err.message);
    }
    setLoading(false);
  };

  // --- RENDER ---
  return (
    <div style={{ maxWidth: 700, margin: "32px auto", padding: 24, background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px #b0bec533" }}>
      {/* Back Button */}
      <button
        type="button"
        onClick={() => window.history.back()}
        style={{
          marginBottom: 16,
          background: "#b0bec5",
          color: "#222",
          border: "none",
          borderRadius: 8,
          padding: "6px 18px",
          fontWeight: 700,
          cursor: "pointer"
        }}
      >
        ← Back
      </button>
      <h2 style={{ color: "#1976d2", fontWeight: 800, marginBottom: 8 }}>Workers Attendance</h2>
      <div style={{ color: "#888", marginBottom: 24 }}>{today}</div>
      {submittedToday ? (
        <div style={{ color: "#43a047", fontWeight: 700, fontSize: 22, textAlign: "center", margin: "48px 0" }}>
  You have already submitted your attendance for today.<br />
  <span style={{ color: "#1976d2" }}>Come back again tomorrow!</span>

  {submittedData && (
  <div
    style={{
      marginTop: 32,
      textAlign: "left",
      fontSize: 16,
      background: "#f9f9f9",
      padding: 24,
      borderRadius: 12,
      border: "1px solid #ccc",
      maxWidth: 700,
    }}
  >
    <h3 style={{ color: "#1976d2", marginBottom: 20 }}>Your Submission:</h3>

    {/* Site Deployments */}
    <div style={{ marginBottom: 32 }}>
      <h4 style={{ marginBottom: 12, color: "#333" }}>Site Deployments</h4>
      {submittedData.site.length === 0 ? (
        <div style={{ color: "#555" }}>None</div>
      ) : (
        submittedData.site.map((s, i) => (
          <div key={i} style={{ marginBottom: 16, paddingLeft: 16 }}>
            <div>
              <strong style={{ color: "#333" }}>Client:</strong>{" "}
              <span style={{ color: "#555" }}>{s.clientName}</span>
            </div>
            <div>
              <strong style={{ color: "#333" }}>Location:</strong>{" "}
              <span style={{ color: "#555" }}>{s.location}</span>
            </div>
            <div style={{ marginTop: 8, paddingLeft: 16 }}>
              <div style={{ marginBottom: 6 }}>
                <strong style={{ color: "#333" }}>Workers:</strong>
                {s.workers.length > 0 ? (
                  <ul style={{ paddingLeft: 20, color: "#555", marginTop: 4 }}>
                    {s.workers.map((w, j) => (
                      <li key={j}>{w}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ marginLeft: 8 }}>None</span>
                )}
              </div>
              <div>
                <strong style={{ color: "#333" }}>Vehicles:</strong>
                {s.vehicles.length > 0 ? (
                  <ul style={{ paddingLeft: 20, color: "#555", marginTop: 4 }}>
                    {s.vehicles.map((v, j) => (
                      <li key={j}>{v}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ marginLeft: 8 }}>None</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Fabrication Sites */}
    <div style={{ marginBottom: 32 }}>
      <h4 style={{ marginBottom: 12, color: "#333" }}>Fabrication Sites</h4>
      {submittedData.fabrications.length === 0 ? (
        <div style={{ color: "#555" }}>None</div>
      ) : (
        submittedData.fabrications.map((f, i) => (
          <div key={i} style={{ marginBottom: 16, paddingLeft: 16 }}>
            <div>
              <strong style={{ color: "#333" }}>Client:</strong>{" "}
              <span style={{ color: "#555" }}>{f.clientName}</span>
            </div>
            <div>
              <strong style={{ color: "#333" }}>Location:</strong>{" "}
              <span style={{ color: "#555" }}>{f.location}</span>
            </div>
            <div style={{ marginTop: 8, paddingLeft: 16 }}>
              <strong style={{ color: "#333" }}>Workers:</strong>
              {f.workers.length > 0 ? (
                <ul style={{ paddingLeft: 20, color: "#555", marginTop: 4 }}>
                  {f.workers.map((w, j) => (
                    <li key={j}>{w}</li>
                  ))}
                </ul>
              ) : (
                <span style={{ marginLeft: 8 }}>None</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>

    {/* Other Groups */}
    <div style={{ marginBottom: 16 }}>
      <strong style={{ color: "#333" }}>Tool Room:</strong>{" "}
      <span style={{ color: "#555" }}>
        {submittedData.toolRoomWorkers.length > 0
          ? submittedData.toolRoomWorkers.join(", ")
          : "None"}
      </span>
    </div>

    <div style={{ marginBottom: 16 }}>
      <strong style={{ color: "#333" }}>Utility:</strong>{" "}
      <span style={{ color: "#555" }}>
        {submittedData.utilityWorkers.length > 0
          ? submittedData.utilityWorkers.join(", ")
          : "None"}
      </span>
    </div>

    <div style={{ marginBottom: 16 }}>
      <strong style={{ color: "#333" }}>Maintenance Car:</strong>{" "}
      <span style={{ color: "#555" }}>
        {submittedData.maintenanceCarWorkers.length > 0
          ? submittedData.maintenanceCarWorkers.join(", ")
          : "None"}
      </span>
    </div>

    <div style={{ marginBottom: 16 }}>
      <strong style={{ color: "#333" }}>Absent:</strong>{" "}
      <span style={{ color: "#555" }}>
        {submittedData.absent.length > 0
          ? submittedData.absent.join(", ")
          : "None"}
      </span>
    </div>

    <div>
      <strong style={{ color: "#333" }}>Add-ons:</strong>{" "}
      <span style={{ color: "#555" }}>
        {submittedData.addOns ? submittedData.addOns : "None"}
      </span>
    </div>
  </div>
)}


</div>

      ) : (
      <form onSubmit={handleSubmit}>
        {/* Site Category */}
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Site</h3>
        {sites.map((site, idx) => {
  const unavailableWorkers = getAllSelectedWorkers({ type: "site", idx });
  const unavailableVehicles = getAllSelectedVehicles(idx);
  return (
    <div
      key={idx}
      style={{
        position: "relative",
        border: "1px solid #e3e8f7",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16
      }}
    >
      {sites.length > 1 && (
        <button
          type="button"
          onClick={() => removeSite(idx)}
          style={{
            position: "absolute",
            top: 6,
            right: 10,
            background: "transparent",
            border: "none",
            fontSize: 20,
            color: "#d32f2f",
            cursor: "pointer"
          }}
          title="Remove this site"
        >
          ×
        </button>
      )}

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 600, color: "#1976d2" }}>Client Name: </label>
                <input
                  type="text"
                  value={site.clientName}
                  onChange={e => updateSite(idx, "clientName", e.target.value)}
                  placeholder="Enter client name"
                  style={{ marginLeft: 8, padding: 4, borderRadius: 6, border: "1px solid #b0bec5", width: "60%", fontSize: "16px" }}
                  required
                />
              </div>
              <div>
                <label>Location: </label>
                <input
                  type="text"
                  value={site.location}
                  onChange={e => updateSite(idx, "location", e.target.value)}
                  style={{ margin: "0 0 8px 8px", padding: 4, borderRadius: 6, border: "1px solid #b0bec5", fontSize: "16px" }}
                  required
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <label>Workers: </label>
                <Select
                  isMulti
                  options={workers.filter(w => !unavailableWorkers.includes(w)).map(w => ({ value: w, label: w }))}
                  value={site.workers.map(w => ({ value: w, label: w }))}
                  onChange={selected => updateSite(idx, "workers", selected.map(s => s.value))}
                  placeholder="Select workers..."
                  styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <label>Vehicle Used: </label>
                <Select
                  isMulti
                  options={vehicles.filter(v => !unavailableVehicles.includes(v)).map(v => ({ value: v, label: v }))}
                  value={site.vehicles.map(v => ({ value: v, label: v }))}
                  onChange={selected => updateSite(idx, "vehicles", selected.map(s => s.value))}
                  placeholder="Select vehicles..."
                  styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
                />
              </div>
            </div>
          );
        })}
        <button type="button" onClick={addSite} style={{ marginBottom: 16, background: "#1976d2", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 700 }}>Add Another Site</button>
                {/* Fabrication Category */}
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Fabrication</h3>
        {fabrications.map((fab, idx) => {
  const unavailableWorkers = getAllSelectedWorkers({ type: "fab", idx });
  return (
    <div
      key={idx}
      style={{
        position: "relative",
        border: "1px solid #e3e8f7",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16
      }}
    >
      {fabrications.length > 1 && (
        <button
          type="button"
          onClick={() => removeFabrication(idx)}
          style={{
            position: "absolute",
            top: 6,
            right: 10,
            background: "transparent",
            border: "none",
            fontSize: 20,
            color: "#d32f2f",
            cursor: "pointer"
          }}
          title="Remove this fabrication"
        >
          ×
        </button>
      )}

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 600, color: "#1976d2" }}>Client Name: </label>
                <input
                  type="text"
                  value={fab.clientName}
                  onChange={e => updateFabrication(idx, "clientName", e.target.value)}
                  placeholder="n/a if not applicable"
                  style={{ marginLeft: 8, padding: 4, borderRadius: 6, border: "1px solid #b0bec5", width: "60%", fontSize: "16px" }}
                  required
                />
              </div>
              <div>
                <label>Location: </label>
                <input
                  type="text"
                  value={fab.location}
                  onChange={e => updateFabrication(idx, "location", e.target.value)}
                  style={{ margin: "0 0 8px 8px", padding: 4, borderRadius: 6, border: "1px solid #b0bec5", fontSize: "16px" }}
                  required
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <label>Workers: </label>
                <Select
                  isMulti
                  options={workers.filter(w => !unavailableWorkers.includes(w)).map(w => ({ value: w, label: w }))}
                  value={fab.workers.map(w => ({ value: w, label: w }))}
                  onChange={selected => updateFabrication(idx, "workers", selected.map(s => s.value))}
                  placeholder="Select workers..."
                  styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
                />
              </div>
            </div>
          );
        })}
        <button type="button" onClick={addFabrication} style={{ marginBottom: 16, background: "#1976d2", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 700 }}>Add Another Fabrication</button>
        
        {/* Absent Category */}
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Absent</h3>
        <div style={{ border: "1px solid #e3e8f7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <Select
            isMulti
            options={workers.filter(w => !getAllSelectedWorkers({ type: "absent" }).includes(w)).map(w => ({ value: w, label: w }))}
            value={absent.map(w => ({ value: w, label: w }))}
            onChange={selected => setAbsent(selected.map(s => s.value))}
            placeholder="Select absent workers..."
            styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
          />
        </div>
        {/* Utility Category */}
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Utility</h3>
        <div style={{ border: "1px solid #e3e8f7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <Select
            isMulti
            options={workers.filter(w => !getAllSelectedWorkers({ type: "utility" }).includes(w)).map(w => ({ value: w, label: w }))}
            value={utilityWorkers.map(w => ({ value: w, label: w }))}
            onChange={selected => setUtilityWorkers(selected.map(s => s.value))}
            placeholder="Select utility workers..."
            styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
          />
        </div>
        {/* Maintenance Car Category */}
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Maintenance Car</h3>
        <div style={{ border: "1px solid #e3e8f7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <Select
            isMulti
            options={workers.filter(w => !getAllSelectedWorkers({ type: "maint" }).includes(w)).map(w => ({ value: w, label: w }))}
            value={maintenanceCarWorkers.map(w => ({ value: w, label: w }))}
            onChange={selected => setMaintenanceCarWorkers(selected.map(s => s.value))}
            placeholder="Select maintenance car workers..."
            styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
          />
        </div>
        {/* Tool Room Category */}
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Tool Room</h3>
        <div style={{ border: "1px solid #e3e8f7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <Select
            isMulti
            options={workers.filter(w => !getAllSelectedWorkers({ type: "tool" }).includes(w)).map(w => ({ value: w, label: w }))}
            value={toolRoomWorkers.map(w => ({ value: w, label: w }))}
            onChange={selected => setToolRoomWorkers(selected.map(s => s.value))}
            placeholder="Select tool room workers..."
            styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
          />
        </div>
        {/* Add-ons Section */}
        <h3 style={{ color: "#1976d2", marginTop: 24 }}>Add-ons</h3>
        <div style={{ border: "1px solid #e3e8f7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <input
            type="text"
            value={addOns}
            onChange={e => setAddOns(e.target.value)}
            placeholder="n/a if not applicable"
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #b0bec5", fontSize: "16px" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: 8, padding: "10px 32px", fontWeight: 700, fontSize: 18, marginTop: 16 }}
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </form>
      )}
    </div>
  );
}