import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function ExamsPage({ user }) {
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { type: 'text', question: '', options: [''], correctAnswer: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [sendExamId, setSendExamId] = useState(null);
  const [sendToUser, setSendToUser] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const navigate = useNavigate();

  // Fetch exams and users
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      const examsCol = collection(db, 'exams');
      let snapshot;
      if (user?.role === "admin") {
        snapshot = await getDocs(examsCol);
      } else if (user?.role === "user") {
        const q = query(examsCol, where("assignedTo", "array-contains", user.uid));
        snapshot = await getDocs(q);
      }
      const allExams = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
      setExams(allExams);
      setLoading(false);
    };
    if (user) fetchExams();
  }, [user, showSendModal]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role === "admin") {
        const usersCol = collection(db, 'users');
        const snapshot = await getDocs(usersCol);
        setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      }
    };
    fetchUsers();
  }, [user]);
    // Admin: Create exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    const sanitizedQuestions = questions.map(q => ({
      type: q.type || "text",
      question: q.question || "",
      options: q.type === "mcq" ? (q.options || []).filter(opt => opt && opt.trim() !== "") : [],
      correctAnswer: q.correctAnswer || ""
    }));
    await addDoc(collection(db, 'exams'), {
      title: title || "",
      description: description || "",
      questions: sanitizedQuestions,
      assignedTo: [] // Exams are created unassigned
    });
    setTitle('');
    setDescription('');
    setQuestions([{ type: 'text', question: '', options: [''], correctAnswer: '' }]);
  };

  // Delete selected exams
  const handleDeleteSelected = async () => {
    for (const examId of selectedExams) {
      await deleteDoc(doc(db, 'exams', examId));
    }
    setSelectedExams([]);
  };

  // --- Admin UI ---
  if (user?.role === "admin") {
    return (
      <div style={{
        maxWidth: 700,
        margin: '40px auto',
        padding: 32,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        boxShadow: '0 8px 32px #cfd8dc',
        minHeight: 500
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 24,
            boxShadow: '0 2px 8px #e3e3e3',
            cursor: 'pointer'
          }}
        >
          ← Back to Main Menu
        </button>
        <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24 }}>Create New Exam</h2>
        <form onSubmit={handleCreateExam} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Exam Title"
              required
              style={{
                flex: 2,
                padding: 12,
                borderRadius: 8,
                border: '1.5px solid #b0bec5',
                fontSize: 18,
                background: '#f5f7fa'
              }}
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              style={{
                flex: 3,
                padding: 12,
                borderRadius: 8,
                border: '1.5px solid #b0bec5',
                fontSize: 18,
                background: '#f5f7fa',
                minHeight: 44
              }}
            />
          </div>
          <h4 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 10 }}>Questions</h4>
          {questions.map((q, idx) => (
            <div key={idx} style={{ marginBottom: 18, border: '1px solid #e3e8f7', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <select
                  value={q.type}
                  onChange={e => {
                    const newQuestions = [...questions];
                    newQuestions[idx].type = e.target.value;
                    if (e.target.value === 'mcq') newQuestions[idx].options = [''];
                    if (e.target.value !== 'mcq') newQuestions[idx].options = [''];
                    setQuestions(newQuestions);
                  }}
                  style={{
                    borderRadius: 6,
                    border: '1.5px solid #b0bec5',
                    fontSize: 15,
                    padding: '6px 10px'
                  }}
                >
                  <option value="text">Text</option>
                  <option value="mcq">MCQ</option>
                  <option value="likert">Likert (1-5)</option>
                </select>
                <input
                  value={q.question}
                  onChange={e => {
                    const newQuestions = [...questions];
                    newQuestions[idx].question = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="Question"
                  required
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 6,
                    border: '1.5px solid #b0bec5',
                    fontSize: 16,
                    background: '#f5f7fa'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                  style={{
                    background: '#e53935',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
              {/* MCQ Options */}
              {q.type === 'mcq' && (
                <div style={{ marginLeft: 0 }}>
                  {q.options.map((opt, oidx) => (
                    <div key={oidx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <input
                        value={opt}
                        onChange={e => {
                          const newQuestions = [...questions];
                          newQuestions[idx].options[oidx] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        placeholder={`Option ${oidx + 1}`}
                        style={{
                          flex: 1,
                          padding: 8,
                          borderRadius: 6,
                          border: '1.5px solid #b0bec5',
                          fontSize: 15,
                          background: '#f5f7fa'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newQuestions = [...questions];
                          newQuestions[idx].options = newQuestions[idx].options.filter((_, i) => i !== oidx);
                          setQuestions(newQuestions);
                        }}
                        style={{
                          background: '#e53935',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '2px 10px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newQuestions = [...questions];
                      newQuestions[idx].options.push('');
                      setQuestions(newQuestions);
                    }}
                    style={{
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: 4
                    }}
                  >
                    + Add Option
                  </button>
                  {/* MCQ Correct Answer */}
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontWeight: 600, color: '#1976d2' }}>Correct Answer: </label>
                    <select
                      value={q.correctAnswer || ''}
                      onChange={e => {
                        const newQuestions = [...questions];
                        newQuestions[idx].correctAnswer = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      style={{ marginLeft: 8, borderRadius: 6, border: '1.5px solid #b0bec5', fontSize: 15, padding: '6px 10px' }}
                    >
                      <option value="">Select correct option</option>
                      {q.options.map((opt, oidx) => (
                        <option key={oidx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {/* Text Correct Answer */}
              {q.type === 'text' && (
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontWeight: 600, color: '#1976d2' }}>Correct Answer: </label>
                  <input
                    value={q.correctAnswer || ''}
                    onChange={e => {
                      const newQuestions = [...questions];
                      newQuestions[idx].correctAnswer = e.target.value;
                      setQuestions(newQuestions);
                    }}
                    style={{ marginLeft: 8, borderRadius: 6, border: '1.5px solid #b0bec5', fontSize: 15, padding: '6px 10px' }}
                    placeholder="Correct answer"
                  />
                </div>
              )}
              {/* Likert: (optional, usually not scored) */}
              {q.type === 'likert' && (
                <div style={{ marginTop: 8, color: '#1976d2', fontWeight: 500 }}>
                  Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQuestions([...questions, { type: 'text', question: '', options: [''], correctAnswer: '' }])}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              marginBottom: 18
            }}
          >
            + Add Question
          </button>
          <button
            type="submit"
            style={{
              background: '#43a047',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer'
            }}
          >
            Create Exam
          </button>
        </form>
        <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>All Exams</h2>
        <div style={{ marginBottom: 16 }}>
          <button
            disabled={selectedExams.length === 0}
            onClick={handleDeleteSelected}
            style={{
              background: selectedExams.length === 0 ? '#b0bec5' : '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 16,
              cursor: selectedExams.length === 0 ? 'not-allowed' : 'pointer',
              marginBottom: 12
            }}
          >
            Delete Selected
          </button>
        </div>
        {loading ? <p>Loading...</p> : (
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {exams.map(exam => (
              <li key={exam.id} style={{
                background: '#f5f7fa',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 12,
                fontSize: 18,
                color: '#22223b',
                boxShadow: '0 2px 8px #e3e3e3',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="checkbox"
                  checked={selectedExams.includes(exam.id)}
                  onChange={e => {
                    setSelectedExams(prev =>
                      e.target.checked
                        ? [...prev, exam.id]
                        : prev.filter(id => id !== exam.id)
                    );
                  }}
                  style={{ marginRight: 12 }}
                />
                <div style={{ flex: 1 }}>
                  <strong>{exam.title}</strong>
                  <div style={{ color: '#1976d2', fontSize: 15 }}>{exam.description}</div>
                </div>
                <button
                  onClick={() => {
                    setSendExamId(exam.id);
                    setShowSendModal(true);
                  }}
                  style={{
                    marginLeft: 16,
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer'
                  }}
                >
                  Send to User
                </button>
              </li>
            ))}
          </ul>
        )}
                {/* Send to User Modal */}
        {showSendModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px #e3e3e3'
            }}>
              <h3 style={{ marginBottom: 18 }}>Send Exam to User</h3>
              <select
                value={sendToUser}
                onChange={e => setSendToUser(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #b0bec5', fontSize: 16, marginBottom: 18 }}
              >
                <option value="">Select user...</option>
                {allUsers.map(u => (
                  <option key={u.uid} value={u.uid}>{u.email} ({u.role})</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  disabled={!sendToUser}
                  onClick={async () => {
                    if (!sendToUser) return;
                    const examRef = doc(db, 'exams', sendExamId);
                    await updateDoc(examRef, {
                      assignedTo: arrayUnion(sendToUser)
                    });
                    setShowSendModal(false);
                    setSendToUser('');
                    setSendExamId(null);
                  }}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: !sendToUser ? 'not-allowed' : 'pointer'
                  }}
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setShowSendModal(false);
                    setSendToUser('');
                    setSendExamId(null);
                  }}
                  style={{
                    background: '#b0bec5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontWeight: 700,
                    fontSize: 16
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  // --- User UI ---
  return (
    <div style={{
      maxWidth: 700,
      margin: '40px auto',
      padding: 32,
      background: 'rgba(255,255,255,0.95)',
      borderRadius: 24,
      boxShadow: '0 8px 32px #cfd8dc',
      minHeight: 500,
      position: 'relative'
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 24,
          boxShadow: '0 2px 8px #e3e3e3',
          cursor: 'pointer'
        }}
      >
        ← Back to Main Menu
      </button>
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 24 }}>Assigned Exams</h2>
      {loading ? <p>Loading...</p> : (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {exams.length === 0 ? (
            <li style={{ color: '#888', fontSize: 18 }}>No exams assigned to you yet.</li>
          ) : (
            exams.map(exam => (
              <li
                key={exam.id}
                style={{
                  background: '#f5f7fa',
                  borderRadius: 10,
                  padding: '14px 18px',
                  marginBottom: 12,
                  fontSize: 18,
                  color: '#22223b',
                  boxShadow: '0 2px 8px #e3e3e3',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'box-shadow 0.2s, transform 0.2s'
                }}
                onClick={() => navigate(`/exams/${exam.id}/take`)}
              >
                <strong>{exam.title}</strong>
                <div style={{ color: '#1976d2', fontSize: 15 }}>{exam.description}</div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}