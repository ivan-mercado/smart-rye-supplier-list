import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { db } from "./firebase";
import html2canvas from "html2canvas";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function WorkersAttendanceAdminPage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newWorker, setNewWorker] = useState("");
  const [editingWorker, setEditingWorker] = useState(null);
  const [editingWorkerName, setEditingWorkerName] = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingVehicleName, setEditingVehicleName] = useState("");
  const [showWorkers, setShowWorkers] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [searchWorker, setSearchWorker] = useState("");


  // Edit attendance state
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingCategory, setEditingCategory] = useState("");

  const recordRefs = useRef({});
const handleSaveAsPicture = async (id, date) => {
  const ref = recordRefs.current[id];
  if (ref) {
    const canvas = await html2canvas(ref, {
      useCORS: true,
      backgroundColor: "#fff"
    });
    const link = document.createElement("a");
    link.download = `attendance-${date}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
};



  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers_list"), (snap) => {
      setWorkers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "vehicles_list"), (snap) => {
      setVehicles(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    const q = query(collection(db, "workers_attendance"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setAttendanceRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Worker/Vehicle CRUD
  const handleAddWorker = async () => {
    if (!newWorker.trim()) return;
    await addDoc(collection(db, "workers_list"), { name: newWorker.trim() });
    setNewWorker("");
  };
  const handleEditWorker = async (id) => {
    if (!editingWorkerName.trim()) return;
    await updateDoc(doc(db, "workers_list", id), { name: editingWorkerName.trim() });
    setEditingWorker(null);
    setEditingWorkerName("");
  };
  const handleDeleteWorker = async (id) => {
    if (window.confirm("Delete this worker?")) {
      await deleteDoc(doc(db, "workers_list", id));
    }
  };
  const handleAddVehicle = async () => {
    if (!newVehicle.trim()) return;
    await addDoc(collection(db, "vehicles_list"), { name: newVehicle.trim() });
    setNewVehicle("");
  };
  const handleEditVehicle = async (id) => {
    if (!editingVehicleName.trim()) return;
    await updateDoc(doc(db, "vehicles_list", id), { name: editingVehicleName.trim() });
    setEditingVehicle(null);
    setEditingVehicleName("");
  };
  const handleDeleteVehicle = async (id) => {
    if (window.confirm("Delete this vehicle?")) {
      await deleteDoc(doc(db, "vehicles_list", id));
    }
  };

  // Attendance Edit/Delete
  const handleDeleteAttendance = async (id) => {
    if (window.confirm("Delete this attendance record?")) {
      await deleteDoc(doc(db, "workers_attendance", id));
    }
  };
  const startEditAttendance = (record) => {
    setEditingAttendanceId(record.id);
    setEditingRecord(JSON.parse(JSON.stringify(record)));
    setEditingCategory("");
  };
  const handleEditField = (field, value) => {
    setEditingRecord(prev => ({ ...prev, [field]: value }));
  };
  const handleSaveEditAttendance = async (id) => {
    const { id: _id, ...data } = editingRecord;
    await updateDoc(doc(db, "workers_attendance", id), data);
    setEditingAttendanceId(null);
    setEditingRecord(null);
    setEditingCategory("");
  };
  const handleCancelEditAttendance = () => {
    setEditingAttendanceId(null);
    setEditingRecord(null);
    setEditingCategory("");
  };

  // --- Site/Fabrication Handlers for Edit Form ---
  const updateEditSite = (idx, field, value) => {
    setEditingRecord(prev => {
      const updated = [...prev.site];
      updated[idx][field] = value;
      return { ...prev, site: updated };
    });
  };
  const addEditSite = () => {
    setEditingRecord(prev => ({
      ...prev,
      site: [...prev.site, { clientName: "", location: "", workers: [], vehicles: [] }]
    }));
  };
  const updateEditFabrication = (idx, field, value) => {
    setEditingRecord(prev => {
      const updated = [...prev.fabrications];
      updated[idx][field] = value;
      return { ...prev, fabrications: updated };
    });
  };
  const addEditFabrication = () => {
    setEditingRecord(prev => ({
      ...prev,
      fabrications: [...prev.fabrications, { clientName: "", location: "", workers: [] }]
    }));
  };
    return (
    <div style={{
      maxWidth: 900,
      margin: "40px auto",
      padding: 32,
      background: "#fff",
      borderRadius: 20,
      boxShadow: "0 4px 24px #e3e3e3"
    }}>
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
      <h2 style={{ color: "#1976d2", fontWeight: 800, marginBottom: 8 }}>Workers Attendance (Admin)</h2>
      <div style={{ color: "#888", marginBottom: 24 }}>View all submitted attendance records</div>

      {/* Worker Management */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#1976d2" }}>Manage Worker Names</h3>
        <button
          onClick={() => setShowWorkers(v => !v)}
          style={{
            marginBottom: 10,
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "4px 16px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {showWorkers ? "Hide" : "Show"} Worker List
        </button>
        {showWorkers && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                value={newWorker}
                onChange={e => setNewWorker(e.target.value)}
                placeholder="Add new worker"
                style={{ padding: 6, borderRadius: 6, border: "1px solid #b0bec5" }}
              />
              <button onClick={handleAddWorker} style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 700 }}>Add</button>
            </div>
            <input
  type="text"
  placeholder="Search worker..."
  value={searchWorker}
  onChange={(e) => setSearchWorker(e.target.value)}
  style={{
    width: "228px",
    padding: 6,
    borderRadius: 6,
    border: "1px solid #b0bec5",
    marginBottom: 10,
  }}
/>

<ul style={{ listStyle: "none", padding: 0 }}>
  {workers
    .filter(w => w.name.toLowerCase().includes(searchWorker.toLowerCase()))
    .map(w =>

                <li key={w.id} style={{ marginBottom: 6 }}>
                  {editingWorker === w.id ? (
                    <>
                      <input
                        value={editingWorkerName}
                        onChange={e => setEditingWorkerName(e.target.value)}
                        style={{ padding: 4, borderRadius: 4, border: "1px solid #b0bec5" }}
                      />
                      <button onClick={() => handleEditWorker(w.id)} style={{ marginLeft: 6, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Save</button>
                      <button onClick={() => setEditingWorker(null)} style={{ marginLeft: 4, background: "#b0bec5", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span>{w.name}</span>
                      <button onClick={() => { setEditingWorker(w.id); setEditingWorkerName(w.name); }} style={{ marginLeft: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Edit</button>
                      <button onClick={() => handleDeleteWorker(w.id)} style={{ marginLeft: 4, background: "#e53935", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Delete</button>
                    </>
                  )}
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      {/* Vehicle Management */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "#1976d2" }}>Manage Vehicles</h3>
        <button
          onClick={() => setShowVehicles(v => !v)}
          style={{
            marginBottom: 10,
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "4px 16px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {showVehicles ? "Hide" : "Show"} Vehicle List
        </button>
        {showVehicles && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                value={newVehicle}
                onChange={e => setNewVehicle(e.target.value)}
                placeholder="Add new vehicle"
                style={{ padding: 6, borderRadius: 6, border: "1px solid #b0bec5" }}
              />
              <button onClick={handleAddVehicle} style={{ background: "#43a047", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontWeight: 700 }}>Add</button>
            </div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {vehicles.map(v =>
                <li key={v.id} style={{ marginBottom: 6 }}>
                  {editingVehicle === v.id ? (
                    <>
                      <input
                        value={editingVehicleName}
                        onChange={e => setEditingVehicleName(e.target.value)}
                        style={{ padding: 4, borderRadius: 4, border: "1px solid #b0bec5" }}
                      />
                      <button onClick={() => handleEditVehicle(v.id)} style={{ marginLeft: 6, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Save</button>
                      <button onClick={() => setEditingVehicle(null)} style={{ marginLeft: 4, background: "#b0bec5", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span>{v.name}</span>
                      <button onClick={() => { setEditingVehicle(v.id); setEditingVehicleName(v.name); }} style={{ marginLeft: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Edit</button>
                      <button onClick={() => handleDeleteVehicle(v.id)} style={{ marginLeft: 4, background: "#e53935", color: "#fff", border: "none", borderRadius: 4, padding: "2px 10px" }}>Delete</button>
                    </>
                  )}
                </li>
              )}
            </ul>
          </>
        )}
      </div>


      {/* Attendance Records */}
{attendanceRecords.length === 0 ? (
  <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
    No attendance records found.
  </div>
) : (
  attendanceRecords.map(record => (
    <div
      key={record.id}
      style={{
        border: "1px solid #e3e8f7",
        borderRadius: 12,
        padding: 18,
        marginBottom: 24,
        background: "#f9f9f9"
      }}
    >
      {/* Save as Picture Button */}
      <button
        onClick={() => handleSaveAsPicture(record.id, record.date)}
        style={{
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "4px 12px",
          marginBottom: 8,
          marginRight: 8
        }}
      >
        Save as Picture
      </button>

      {/* The content to screenshot */}
      <div
  ref={el => (recordRefs.current[record.id] = el)}
  style={{
    paddingLeft: 32, // or 40, or whatever looks good
    background: "#fff" // ensure background is white for screenshot
  }}
>
        <div style={{ fontWeight: 700, color: "#1976d2", fontSize: 18, marginBottom: 2 }}>{record.date}</div>
        <div style={{ color: "#888", fontSize: 14, marginBottom: 10 }}>
          Submitted by: {record.userEmail}
        </div>
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => startEditAttendance(record)}
            style={{ marginRight: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteAttendance(record.id)}
            style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}
          >
            Delete
          </button>
        </div>
        {/* Category selector for editing */}
        {editingAttendanceId === record.id && !editingCategory && (
          <div style={{ margin: "10px 0" }}>
            <b>Choose category to edit:</b>
            <select
              value={editingCategory}
              onChange={e => setEditingCategory(e.target.value)}
              style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
            >
              <option value="">-- Select --</option>
              <option value="site">Site(s)</option>
              <option value="fabrications">Fabrication</option>
              <option value="absent">Absent</option>
              <option value="utilityWorkers">Utility</option>
              <option value="maintenanceCarWorkers">Maintenance Car</option>
              <option value="toolRoomWorkers">Tool Room</option>
              <option value="addOns">Add-ons</option>
            </select>
            <button onClick={handleCancelEditAttendance} style={{ marginLeft: 8, background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}

        {/* Category-specific edit forms */}
        {editingAttendanceId === record.id && editingCategory === "site" && (
          <div style={{ margin: "10px 0" }}>
            <h4>Edit Site(s)</h4>
            {editingRecord.site.map((site, idx) => (
              <div key={idx} style={{ border: "1px solid #e3e8f7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 600, color: "#1976d2" }}>Client Name: </label>
                  <input
                    type="text"
                    value={site.clientName}
                    onChange={e => updateEditSite(idx, "clientName", e.target.value)}
                    placeholder="Enter client name"
                    style={{ marginLeft: 8, padding: 4, borderRadius: 6, border: "1px solid #b0bec5", width: "60%" }}
                    required
                  />
                </div>
                <div>
                  <label>Location: </label>
                  <input
                    type="text"
                    value={site.location}
                    onChange={e => updateEditSite(idx, "location", e.target.value)}
                    style={{ margin: "0 0 8px 8px", padding: 4, borderRadius: 6, border: "1px solid #b0bec5" }}
                    required
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label>Workers: </label>
                  <Select
                    isMulti
                    options={workers.map(w => ({ value: w.name, label: w.name }))}
                    value={site.workers.map(w => ({ value: w, label: w }))}
                    onChange={selected => updateEditSite(idx, "workers", selected.map(s => s.value))}
                    placeholder="Select workers..."
                    styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label>Vehicle Used: </label>
                  <Select
                    isMulti
                    options={vehicles.map(v => ({ value: v.name, label: v.name }))}
                    value={site.vehicles.map(v => ({ value: v, label: v }))}
                    onChange={selected => updateEditSite(idx, "vehicles", selected.map(s => s.value))}
                    placeholder="Select vehicles..."
                    styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addEditSite} style={{ marginBottom: 16, background: "#1976d2", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 700 }}>Add Another Site</button>
            <br />
            <button onClick={() => handleSaveEditAttendance(record.id)} style={{ marginRight: 8, background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}>Save</button>
            <button onClick={handleCancelEditAttendance} style={{ background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}

        {editingAttendanceId === record.id && editingCategory === "fabrications" && (
          <div style={{ margin: "10px 0" }}>
            <h4>Edit Fabrication(s)</h4>
            {editingRecord.fabrications.map((fab, idx) => (
              <div key={idx} style={{ border: "1px solid #e3e8f7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 600, color: "#1976d2" }}>Client Name: </label>
                  <input
                    type="text"
                    value={fab.clientName}
                    onChange={e => updateEditFabrication(idx, "clientName", e.target.value)}
                    placeholder="Enter client name"
                    style={{ marginLeft: 8, padding: 4, borderRadius: 6, border: "1px solid #b0bec5", width: "60%" }}
                    required
                  />
                </div>
                <div>
                  <label>Location: </label>
                  <input
                    type="text"
                    value={fab.location}
                    onChange={e => updateEditFabrication(idx, "location", e.target.value)}
                    style={{ margin: "0 0 8px 8px", padding: 4, borderRadius: 6, border: "1px solid #b0bec5" }}
                    required
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <label>Workers: </label>
                  <Select
                    isMulti
                    options={workers.map(w => ({ value: w.name, label: w.name }))}
                    value={fab.workers.map(w => ({ value: w, label: w }))}
                    onChange={selected => updateEditFabrication(idx, "workers", selected.map(s => s.value))}
                    placeholder="Select workers..."
                    styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addEditFabrication} style={{ marginBottom: 16, background: "#1976d2", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontWeight: 700 }}>Add Another Fabrication</button>
            <br />
            <button onClick={() => handleSaveEditAttendance(record.id)} style={{ marginRight: 8, background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}>Save</button>
            <button onClick={handleCancelEditAttendance} style={{ background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}

        {editingAttendanceId === record.id && editingCategory === "absent" && (
          <div style={{ margin: "10px 0" }}>
            <h4>Edit Absent</h4>
            <Select
              isMulti
              options={workers.map(w => ({ value: w.name, label: w.name }))}
              value={editingRecord.absent.map(w => ({ value: w, label: w }))}
              onChange={selected => handleEditField("absent", selected.map(s => s.value))}
              placeholder="Select absent workers..."
              styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
            />
            <br />
            <button onClick={() => handleSaveEditAttendance(record.id)} style={{ marginRight: 8, background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}>Save</button>
            <button onClick={handleCancelEditAttendance} style={{ background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}

        {editingAttendanceId === record.id && editingCategory === "utilityWorkers" && (
          <div style={{ margin: "10px 0" }}>
            <h4>Edit Utility Workers</h4>
            <Select
              isMulti
              options={workers.map(w => ({ value: w.name, label: w.name }))}
              value={editingRecord.utilityWorkers.map(w => ({ value: w, label: w }))}
              onChange={selected => handleEditField("utilityWorkers", selected.map(s => s.value))}
              placeholder="Select utility workers..."
              styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
            />
            <br />
            <button onClick={() => handleSaveEditAttendance(record.id)} style={{ marginRight: 8, background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}>Save</button>
            <button onClick={handleCancelEditAttendance} style={{ background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}
                {editingAttendanceId === record.id && editingCategory === "maintenanceCarWorkers" && (
          <div style={{ margin: "10px 0" }}>
            <h4>Edit Maintenance Car Workers</h4>
            <Select
              isMulti
              options={workers.map(w => ({ value: w.name, label: w.name }))}
              value={editingRecord.maintenanceCarWorkers.map(w => ({ value: w, label: w }))}
              onChange={selected => handleEditField("maintenanceCarWorkers", selected.map(s => s.value))}
              placeholder="Select maintenance car workers..."
              styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
            />
            <br />
            <button onClick={() => handleSaveEditAttendance(record.id)} style={{ marginRight: 8, background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}>Save</button>
            <button onClick={handleCancelEditAttendance} style={{ background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}

        {editingAttendanceId === record.id && editingCategory === "toolRoomWorkers" && (
          <div style={{ margin: "10px 0" }}>
            <h4>Edit Tool Room Workers</h4>
            <Select
              isMulti
              options={workers.map(w => ({ value: w.name, label: w.name }))}
              value={editingRecord.toolRoomWorkers.map(w => ({ value: w, label: w }))}
              onChange={selected => handleEditField("toolRoomWorkers", selected.map(s => s.value))}
              placeholder="Select tool room workers..."
              styles={{ container: base => ({ ...base, minWidth: 200, marginTop: 4 }) }}
            />
            <br />
            <button onClick={() => handleSaveEditAttendance(record.id)} style={{ marginRight: 8, background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}>Save</button>
            <button onClick={handleCancelEditAttendance} style={{ background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}

        {editingAttendanceId === record.id && editingCategory === "addOns" && (
          <div style={{ margin: "10px 0" }}>
            <h4>Edit Add-ons</h4>
            <input
              type="text"
              value={editingRecord.addOns}
              onChange={e => handleEditField("addOns", e.target.value)}
              style={{ width: "100%", marginBottom: 6 }}
            />
            <button onClick={() => handleSaveEditAttendance(record.id)} style={{ marginRight: 8, background: "#43a047", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px" }}>Save</button>
            <button onClick={handleCancelEditAttendance} style={{ background: "#b0bec5", color: "#222", border: "none", borderRadius: 4, padding: "4px 12px" }}>Cancel</button>
          </div>
        )}

        {/* Record display (unchanged) */}
        <hr style={{ margin: "10px 0" }} />
        <div>
          <strong>Site(s):</strong>
          {record.site && record.site.map((site, idx) => (
            <div key={idx} style={{ marginLeft: 16, marginBottom: 8 }}>
              <div><b>Client Name:</b> {site.clientName || "N/A"}</div>
              <div><b>Location:</b> {site.location}</div>
              {site.vehicles && site.vehicles.length > 0 && (
                <div>
                  <b>Vehicle:</b> {site.vehicles[0]}
                </div>
              )}
              {site.workers && site.workers.length > 0 && (
                <div>
                  <b>Workers:</b>
                  <ul style={{ margin: "2px 0 2px 18px" }}>
                    {site.workers.map(w => <li key={w}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <hr style={{ margin: "10px 0" }} />
        <div>
          <strong>Fabrication:</strong>
          {record.fabrications && record.fabrications.length > 0 ? (
            record.fabrications.map((fab, idx) => (
              <div key={idx} style={{ marginLeft: 16, marginBottom: 8 }}>
                <div><b>Client Name:</b> {fab.clientName || "N/A"}</div>
                {fab.location && (
                  <div>
                    <b>Location:</b> {fab.location}
                  </div>
                )}
                {fab.workers && fab.workers.length > 0 && (
                  <div>
                    <b>Workers:</b>
                    <ul style={{ margin: "2px 0 2px 18px" }}>
                      {fab.workers.map(w => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ marginLeft: 16 }}>No fabrication data</div>
          )}
        </div>
        <hr style={{ margin: "10px 0" }} />
        <div>
          <strong>Absent:</strong>
          {record.absent && record.absent.length > 0 ? (
            <ul style={{ margin: "2px 0 2px 18px" }}>
              {record.absent.map(w => <li key={w}>{w}</li>)}
            </ul>
          ) : " None"}
        </div>
        <hr style={{ margin: "10px 0" }} />
        <div>
          <strong>Utility:</strong>
          {record.utilityWorkers && record.utilityWorkers.length > 0 ? (
            <ul style={{ margin: "2px 0 2px 18px" }}>
              {record.utilityWorkers.map(w => <li key={w}>{w}</li>)}
            </ul>
          ) : " None"}
        </div>
        <hr style={{ margin: "10px 0" }} />
        <div>
          <strong>Maintenance Car:</strong>
          {record.maintenanceCarWorkers && record.maintenanceCarWorkers.length > 0 ? (
            <ul style={{ margin: "2px 0 2px 18px" }}>
              {record.maintenanceCarWorkers.map(w => <li key={w}>{w}</li>)}
            </ul>
          ) : " None"}
        </div>
        <hr style={{ margin: "10px 0" }} />
        <div>
          <strong>Tool Room:</strong>
          {record.toolRoomWorkers && record.toolRoomWorkers.length > 0 ? (
            <ul style={{ margin: "2px 0 2px 18px" }}>
              {record.toolRoomWorkers.map(w => <li key={w}>{w}</li>)}
            </ul>
          ) : " None"}
        </div>
        <hr style={{ margin: "10px 0" }} />
        <div>
          <strong>Other Add-ons:</strong>
          <div style={{ marginLeft: 16 }}>
            {record.addOns ? record.addOns : "None"}
          </div>
        </div>
      </div>
    </div>
  ))
)}
    </div>
  );
}