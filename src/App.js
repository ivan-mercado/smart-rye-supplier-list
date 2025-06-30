import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,      // <-- add this
  where       // <-- add this
} from 'firebase/firestore';

const MESSAGING_APPS = [
  'Viber',
  'Messenger',
  'WhatsApp',
  'Phone Only',
];

function AddSupplier({ onAdd }) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    contact: '',
    messagingApp: '',
  });
  const [itemInput, setItemInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [items, setItems] = useState([]);
  const [showPriceInput, setShowPriceInput] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Enter on item input
  const handleItemKeyDown = (e) => {
    if (e.key === 'Enter' && itemInput.trim() !== '') {
      e.preventDefault();
      setShowPriceInput(true);
    }
  };

  // Handle Enter on price input
  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter' && priceInput.trim() !== '') {
      e.preventDefault();
      setItems((prev) => [
        ...prev,
        { name: itemInput.trim(), price: priceInput.trim() }
      ]);
      setItemInput('');
      setPriceInput('');
      setShowPriceInput(false);
    }
  };

  // Remove item from list
  const handleRemoveItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.address ||
      !form.contact ||
      !form.messagingApp ||
      items.length === 0
    ) {
      alert('Please fill in all fields and add at least one item.');
      return;
    }
    await onAdd({
      ...form,
      items,
    });
    setForm({ name: '', address: '', contact: '', messagingApp: '' });
    setItems([]);
    setItemInput('');
    setPriceInput('');
    setShowPriceInput(false);
    navigate('/list');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: 32,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        background: '#fff',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 4px 24px #e3e3e3',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 900,
        margin: '0 auto 32px auto'
      }}
    >
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Supplier Name"
        style={inputStyle}
      />
      <input
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="Address"
        style={inputStyle}
      />
      <input
        name="contact"
        value={form.contact}
        onChange={handleChange}
        placeholder="Contact Number"
        style={inputStyle}
      />
      <select
        name="messagingApp"
        value={form.messagingApp}
        onChange={handleChange}
        style={inputStyle}
      >
        <option value="">Select Messaging App</option>
        {MESSAGING_APPS.map((app) => (
          <option key={app} value={app}>{app}</option>
        ))}
      </select>
      <div style={{ flex: '1 1 100%', marginTop: 10 }}>
        <label style={{ fontWeight: 600, color: '#1976d2' }}>Items Offered</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input
            type="text"
            value={itemInput}
            onChange={e => setItemInput(e.target.value)}
            onKeyDown={handleItemKeyDown}
            placeholder="Type item name and press Enter"
            style={{ ...inputStyle, flex: 2, marginBottom: 0 }}
            disabled={showPriceInput}
          />
          {showPriceInput && (
            <input
              type="text"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              onKeyDown={handlePriceKeyDown}
              placeholder="Enter price and press Enter"
              style={{ ...inputStyle, flex: 1, marginBottom: 0, borderColor: '#43a047' }}
              autoFocus
            />
          )}
        </div>
        <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#f5f7fa',
              borderRadius: 6,
              padding: '6px 12px',
              marginBottom: 6
            }}>
              <span style={{ flex: 2 }}>{item.name}</span>
              <span style={{ flex: 1, color: '#43a047', fontWeight: 600 }}>₱ {item.price}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                style={{
                  background: '#e53935',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 10px',
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button type="submit" style={primaryButtonStyle}>
        Add Supplier
      </button>
    </form>
  );
}

function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuth(userCredential.user);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e3f0ff 0%, #f9fbfc 100%)"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "40px 32px 32px 32px",
          borderRadius: 18,
          boxShadow: "0 8px 32px #cfd8dc",
          minWidth: 350,
          maxWidth: 380,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{
          color: "#1976d2",
          fontWeight: 800,
          marginBottom: 24,
          fontSize: 28,
          letterSpacing: 1,
          fontFamily: "Segoe UI, Arial, sans-serif"
        }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        {error && (
          <div style={{
            background: "#ffeaea",
            color: "#d32f2f",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            width: "100%",
            textAlign: "center",
            fontSize: 15,
            fontWeight: 500
          }}>
            {error}
          </div>
        )}
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{
            width: "100%",
            padding: "14px 12px",
            borderRadius: 8,
            border: "1px solid #b0bec5",
            fontSize: 17,
            background: "#f5f7fa",
            marginBottom: 18,
            outline: "none",
            transition: "border 0.2s"
          }}
          autoFocus
          required
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{
            width: "100%",
            padding: "14px 12px",
            borderRadius: 8,
            border: "1px solid #b0bec5",
            fontSize: 17,
            background: "#f5f7fa",
            marginBottom: 18,
            outline: "none",
            transition: "border 0.2s"
          }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 0",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 17,
            marginBottom: 12,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px #e3e3e3",
            transition: "background 0.2s"
          }}
        >
          {loading ? (isLogin ? "Logging in..." : "Signing up...") : (isLogin ? "Login" : "Sign Up")}
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          style={{
            background: "none",
            border: "none",
            color: "#1976d2",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            marginTop: 2,
            marginBottom: 0,
            textDecoration: "underline"
          }}
        >
          {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
        </button>
        <div
    style={{
      marginTop: 32,
      width: "100%",
      borderTop: "1px solid #e0e0e0",
      paddingTop: 18,
      textAlign: "center",
      color: "#1976d2",
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: 1,
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}
  >
    <span style={{ display: "block", color: "#888", fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
      Application developed by
    </span>
    Ivan Mercado, <span style={{ color: "#1976d2", fontWeight: 700 }}>BSCpE</span>
  </div>
</form>
    </div>
  );
}

function SupplierList({ suppliers, onEdit, onDelete, editIndex, editForm, setEditForm, setEditIndex, expandedRows, setExpandedRows }) {
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  function handleEditSave(id) {
    if (!editForm.name || !editForm.address || !editForm.contact || !editForm.messagingApp || !editForm.items) {
      alert('Please fill in all fields.');
      return;
    }
    onEdit(id, {
      name: editForm.name,
      address: editForm.address,
      contact: editForm.contact,
      messagingApp: editForm.messagingApp,
      items: editForm.items.split(',').map((item) => item.trim()),
    });
    setEditIndex(null);
  }

  function handleEditCancel() {
    setEditIndex(null);
  }

  function handleToggleExpand(idx) {
    setExpandedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  return (
    <div style={{
      overflowX: 'auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px #e3e3e3',
      padding: 32,
      maxWidth: 1600,
      margin: '0 auto',
    }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 20 }}>
        <thead>
          <tr style={{ background: '#f5f7fa' }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Address</th>
            <th style={thStyle}>Contact</th>
            <th style={thStyle}>Messaging App</th>
            <th style={thStyle}>Items Offered</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#888' }}>No suppliers added yet.</td>
            </tr>
          ) : (
            suppliers.map((s, idx) => (
              <tr
                key={s.id}
                style={{
                  background: editIndex === s.id ? '#e3f2fd' : idx % 2 === 0 ? '#f9fbfc' : '#f5f7fa',
                  transition: 'background 0.2s',
                }}
              >
                {editIndex === s.id ? (
                  <>
                    <td style={tdStyle}>
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        name="contact"
                        value={editForm.contact}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <select
                        name="messagingApp"
                        value={editForm.messagingApp}
                        onChange={handleEditChange}
                        style={inputStyle}
                      >
                        <option value="">Select Messaging App</option>
                        {MESSAGING_APPS.map((app) => (
                          <option key={app} value={app}>{app}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
    {editForm.items && Array.isArray(editForm.items) && editForm.items.map((item, i) => (
      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <input
          type="text"
          value={item.name}
          onChange={e => {
            const newItems = [...editForm.items];
            newItems[i].name = e.target.value;
            setEditForm(prev => ({ ...prev, items: newItems }));
          }}
          placeholder="Item name"
          style={{ ...inputStyle, width: 120, marginBottom: 0 }}
        />
        <input
          type="text"
          value={item.price}
          onChange={e => {
            const newItems = [...editForm.items];
            newItems[i].price = e.target.value;
            setEditForm(prev => ({ ...prev, items: newItems }));
          }}
          placeholder="Price"
          style={{ ...inputStyle, width: 80, marginBottom: 0 }}
        />
        <button
          type="button"
          onClick={() => {
            const newItems = editForm.items.filter((_, idx) => idx !== i);
            setEditForm(prev => ({ ...prev, items: newItems }));
          }}
          style={{
            background: '#e53935',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          Remove
        </button>
      </li>
    ))}
  </ul>
  <button
    type="button"
    onClick={() => {
      setEditForm(prev => ({
        ...prev,
        items: [...(prev.items || []), { name: '', price: '' }]
      }));
    }}
    style={{
      background: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      padding: '2px 10px',
      cursor: 'pointer',
      fontSize: 13,
      marginTop: 4
    }}
  >
    + Add Item
  </button>
</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button onClick={() => handleEditSave(s.id)} style={successButtonStyle}>
                        Save
                      </button>
                      <button onClick={handleEditCancel} style={secondaryButtonStyle}>
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.address}</td>
                    <td style={tdStyle}>{s.contact}</td>
                    <td style={tdStyle}>{s.messagingApp}</td>
                    <td style={{ ...tdStyle, position: 'relative' }}>
  {Array.isArray(s.items) && s.items.length > 1 ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>
        {expandedRows.includes(s.id)
          ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {s.items.map((item, i) => (
                <li key={i}>
                  {item.name} <span style={{ color: '#43a047', fontWeight: 600 }}>₱ {item.price}</span>
                </li>
              ))}
            </ul>
          )
          : (
            <>
              {s.items[0].name} <span style={{ color: '#43a047', fontWeight: 600 }}>₱ {s.items[0].price}</span>
            </>
          )
        }
      </span>
      <button
        onClick={() => handleToggleExpand(s.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          marginLeft: 8,
          color: '#1976d2',
          padding: 0,
          lineHeight: 1,
          transition: 'color 0.2s',
        }}
        aria-label={expandedRows.includes(s.id) ? 'Show less' : 'Show more'}
      >
        {expandedRows.includes(s.id) ? '▲' : '▼'}
      </button>
    </div>
  ) : (
    Array.isArray(s.items) && s.items[0]
      ? <>
          {s.items[0].name} <span style={{ color: '#43a047', fontWeight: 600 }}>₱ {s.items[0].price}</span>
        </>
      : ''
  )}
</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditIndex(s.id);
                          setEditForm({
                            name: s.name,
                            address: s.address,
                            contact: s.contact,
                            messagingApp: s.messagingApp,
                            items: Array.isArray(s.items) ? s.items.join(', ') : s.items,
                          });
                        }}
                        style={primaryButtonStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        style={dangerButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- Styles ---
const inputStyle = {
  flex: '1 1 220px',
  padding: 14,
  borderRadius: 8,
  border: '1px solid #b0bec5',
  fontSize: 18,
  background: '#f5f7fa',
  marginBottom: 0,
  outline: 'none',
  transition: 'border 0.2s',
};

const thStyle = {
  padding: 20,
  border: 'none',
  fontWeight: 700,
  color: '#1976d2',
  background: '#f5f7fa',
  letterSpacing: 1,
  fontSize: 20,
};

const tdStyle = {
  padding: 18,
  border: 'none',
  fontSize: 18,
  verticalAlign: 'top',
};

const primaryButtonStyle = {
  padding: '6px 14px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  marginRight: 6,
  marginBottom: 0,
  transition: 'background 0.2s',
  display: 'inline-block'
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: '#b0bec5',
  color: '#fff',
  marginRight: 0,
};

const dangerButtonStyle = {
  ...primaryButtonStyle,
  background: '#e53935',
  color: '#fff',
  marginRight: 0,
};

const successButtonStyle = {
  ...primaryButtonStyle,
  background: '#43a047',
  color: '#fff',
  marginRight: 6,
};

// --- Main App ---
function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    contact: '',
    messagingApp: '',
    items: '',
  });
  const [expandedRows, setExpandedRows] = useState([]);
  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
  

  // Real-time Firestore listener
  useEffect(() => {
  if (!user) return;
  const q = query(collection(db, 'suppliers'), where('userId', '==', user.uid));
  const unsub = onSnapshot(q, (snapshot) => {
    setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
  return () => unsub();
}, [user]);

  if (!user) {
    return <AuthForm onAuth={setUser} />;
  }

  const handleAddSupplier = async (supplier) => {
    if (!user) return;
    await addDoc(collection(db, 'suppliers'), { ...supplier, userId: user.uid });
  };

  const handleEditSupplier = async (id, updatedSupplier) => {
    await updateDoc(doc(db, 'suppliers', id), updatedSupplier);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      await deleteDoc(doc(db, 'suppliers', id));
    }
  };

  return (
    <div style={{
      maxWidth: 1300,
      margin: '40px auto',
      padding: 32,
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbfc 100%)',
      borderRadius: 24,
      boxShadow: '0 8px 32px #cfd8dc',
      minHeight: '90vh'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: 32,
        color: '#1976d2',
        letterSpacing: 2,
        fontWeight: 800,
        fontSize: 36,
        fontFamily: 'Segoe UI, Arial, sans-serif'
      }}>
        Smart Rye Automatics Supplier List
      </h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, gap: 16 }}>
        <Link to="/add" style={{ textDecoration: 'none' }}>
          <button
            style={{
              ...primaryButtonStyle,
              background: location.pathname === '/add' ? '#1976d2' : '#b0bec5',
              boxShadow: location.pathname === '/add' ? '0 2px 8px #e3e3e3' : 'none'
            }}
          >
            Add Supplier
          </button>
        </Link>
        <button onClick={() => signOut(getAuth())} style={primaryButtonStyle}>Logout</button>
        <Link to="/list" style={{ textDecoration: 'none' }}>
          <button
            style={{
              ...primaryButtonStyle,
              background: location.pathname === '/list' ? '#1976d2' : '#b0bec5',
              boxShadow: location.pathname === '/list' ? '0 2px 8px #e3e3e3' : 'none'
            }}
          >
            Supplier List
          </button>
        </Link>
      </div>
      <Routes>
        <Route path="/add" element={<AddSupplier onAdd={handleAddSupplier} />} />
        <Route
          path="/list"
          element={
            <SupplierList
              suppliers={suppliers}
              onEdit={handleEditSupplier}
              onDelete={handleDeleteSupplier}
              editIndex={editIndex}
              editForm={editForm}
              setEditForm={setEditForm}
              setEditIndex={setEditIndex}
              expandedRows={expandedRows}
              setExpandedRows={setExpandedRows}
            />
          }
        />
        <Route path="*" element={<AddSupplier onAdd={handleAddSupplier} />} />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}