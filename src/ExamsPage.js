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
  const [showMultiSendModal, setShowMultiSendModal] = useState(false);
  const [results, setResults] = useState([]);
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
  }, [user, showSendModal, showMultiSendModal]);

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

  useEffect(() => {
    const fetchResults = async () => {
      if (user?.role === "user" && user?.uid) {
        const q = query(collection(db, 'results'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        setResults(snapshot.docs.map(doc => doc.data()));
      }
    };
    fetchResults();
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
      assignedTo: []
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
      <div className="exams-admin-root">
        <style>
          {`
          .exams-admin-root {
            max-width: 700px;
            margin: 40px auto;
            padding: 32px 24px;
            background: rgba(255,255,255,0.95);
            border-radius: 24px;
            box-shadow: 0 8px 32px #cfd8dc;
            min-height: 500px;
          }
          .exams-admin-form-row {
            display: flex;
            gap: 16px;
            margin-bottom: 18px;
          }
          .exams-admin-form-row input,
          .exams-admin-form-row textarea {
            font-size: 18px;
            border-radius: 8px;
            border: 1.5px solid #b0bec5;
            background: #f5f7fa;
            padding: 12px;
          }
          .exams-admin-questions {
            margin-bottom: 40px;
          }
          .exams-admin-question-block {
            margin-bottom: 18px;
            border: 1px solid #e3e8f7;
            border-radius: 8px;
            padding: 12px;
          }
          .exams-admin-question-row {
            display: flex;
            gap: 10px;
            margin-bottom: 8px;
            flex-wrap: wrap;
          }
          .exams-admin-question-row select,
          .exams-admin-question-row input {
            border-radius: 6px;
            border: 1.5px solid #b0bec5;
            font-size: 15px;
            padding: 6px 10px;
          }
          .exams-admin-btn {
            background: #1976d2;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 8px 18px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            margin-bottom: 18px;
            margin-right: 8px;
          }
          .exams-admin-btn.green {
            background: #43a047;
            margin-bottom: 0;
          }
          .exams-admin-btn.red {
            background: #e53935;
            margin-bottom: 0;
          }
          .exams-admin-btn.gray {
            background: #b0bec5;
            color: #fff;
            margin-bottom: 0;
          }
          .exams-admin-exam-list {
            padding: 0;
            list-style: none;
          }
          .exams-admin-exam-item {
            background: #f5f7fa;
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 12px;
            font-size: 18px;
            color: #22223b;
            box-shadow: 0 2px 8px #e3e3e3;
            display: flex;
            align-items: center;
          }
          .exams-admin-exam-item input[type="checkbox"] {
            margin-right: 12px;
          }
          /* Modal Styling */
          .exams-admin-send-modal {
            background: #fff;
            border-radius: 16px;
            padding: 36px 32px 28px 32px;
            min-width: 320px;
            max-width: 95vw;
            text-align: center;
            box-shadow: 0 8px 32px #cfd8dc;
          }
          .send-modal-title {
            font-size: 1.3rem;
            font-weight: 800;
            color: #22223b;
            margin-bottom: 18px;
          }
          .send-modal-select {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid #b0bec5;
            font-size: 1.1rem;
            margin-bottom: 18px;
            background: #f5f7fa;
            transition: border 0.18s;
          }
          .send-modal-select:focus {
            border: 2px solid #1976d2;
            outline: none;
          }
          .send-modal-btn {
            min-width: 100px;
            padding: 10px 0;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.1rem;
            margin-right: 12px;
            margin-top: 10px;
            transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.12s;
            cursor: pointer;
            box-shadow: 0 2px 8px #e3e3e3;
          }
          .send-modal-btn.send {
            background: #1976d2;
            color: #fff;
          }
          .send-modal-btn.send:hover:enabled {
            background: #1256a3;
            transform: scale(1.04);
          }
          .send-modal-btn.cancel {
            background: #b0bec5;
            color: #fff;
          }
          .send-modal-btn.cancel:hover:enabled {
            background: #90a4ae;
            color: #fff;
            transform: scale(1.04);
          }
          @media (max-width: 700px) {
            .exams-admin-root {
              max-width: 99vw;
              padding: 18px 2vw;
            }
            .exams-admin-form-row {
              flex-direction: column;
              gap: 10px;
            }
            .exams-admin-send-modal {
              min-width: 0;
              width: 94vw;
              padding: 18px 4vw;
            }
          }
          `}
        </style>
        <button
          onClick={() => navigate('/')}
          className="exams-admin-btn"
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
          {/* ... your create exam form ... */}
          <div className="exams-admin-form-row">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Exam Title"
              required
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description"
              style={{ minHeight: 44 }}
            />
          </div>
          <h4 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 10 }}>Questions</h4>
          <div className="exams-admin-questions">
            {questions.map((q, idx) => (
              <div key={idx} className="exams-admin-question-block">
                <div className="exams-admin-question-row">
                  <select
                    value={q.type}
                    onChange={e => {
                      const newQuestions = [...questions];
                      newQuestions[idx].type = e.target.value;
                      if (e.target.value === 'mcq') newQuestions[idx].options = [''];
                      if (e.target.value !== 'mcq') newQuestions[idx].options = [''];
                      setQuestions(newQuestions);
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
                  />
                  <button
                    type="button"
                    className="exams-admin-btn red"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
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
                          required
                        />
                        <button
                          type="button"
                          className="exams-admin-btn red"
                          onClick={() => {
                            const newQuestions = [...questions];
                            newQuestions[idx].options = newQuestions[idx].options.filter((_, i) => i !== oidx);
                            setQuestions(newQuestions);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="exams-admin-btn"
                      onClick={() => {
                        const newQuestions = [...questions];
                        newQuestions[idx].options.push('');
                        setQuestions(newQuestions);
                      }}
                      style={{ marginTop: 4 }}
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
                        style={{ marginLeft: 8 }}
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
                      style={{ marginLeft: 8 }}
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
          </div>
          <button
            type="button"
            className="exams-admin-btn"
            onClick={() => setQuestions([...questions, { type: 'text', question: '', options: [''], correctAnswer: '' }])}
          >
            + Add Question
          </button>
          <button
            type="submit"
            className="exams-admin-btn green"
          >
            Create Exam
          </button>
        </form>
        <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>All Exams</h2>
        <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
          <button
            disabled={selectedExams.length === 0}
            className={`exams-admin-btn${selectedExams.length === 0 ? " gray" : " red"}`}
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </button>
          <button
            disabled={selectedExams.length === 0}
            className={`exams-admin-btn${selectedExams.length === 0 ? " gray" : ""}`}
            style={{ background: '#1976d2', color: '#fff' }}
            onClick={() => setShowMultiSendModal(true)}
          >
            Send Multiple Exams
          </button>
        </div>
        {loading ? <p>Loading...</p> : (
          <ul className="exams-admin-exam-list">
            {exams.map(exam => (
              <li key={exam.id} className="exams-admin-exam-item">
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
                  className="exams-admin-btn"
                  style={{ marginLeft: 16 }}
                >
                  Send to User
                </button>
              </li>
            ))}
          </ul>
        )}
                {/* Send to User Modal (single exam) */}
        {showSendModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="exams-admin-send-modal">
              <div className="send-modal-title">Send Exam to User</div>
              <select
                className="send-modal-select"
                value={sendToUser}
                onChange={e => setSendToUser(e.target.value)}
              >
                <option value="">Select user...</option>
                {allUsers
                  .filter(u => u.role === "user" && !((exams.find(e => e.id === sendExamId)?.assignedTo || []).includes(u.uid)))
                  .map(u => (
                    <option key={u.uid} value={u.uid}>{u.email} ({u.role})</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button
                  disabled={!sendToUser}
                  className="send-modal-btn send"
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
                >
                  Send
                </button>
                <button
                  className="send-modal-btn cancel"
                  onClick={() => {
                    setShowSendModal(false);
                    setSendToUser('');
                    setSendExamId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Send Multiple Exams Modal */}
        {showMultiSendModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="exams-admin-send-modal">
              <div className="send-modal-title">Send Selected Exams to User</div>
              <select
                className="send-modal-select"
                value={sendToUser}
                onChange={e => setSendToUser(e.target.value)}
              >
                <option value="">Select user...</option>
                {allUsers
                  .filter(u => u.role === "user")
                  .map(u => (
                    <option key={u.uid} value={u.uid}>{u.email} ({u.role})</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <button
                  disabled={!sendToUser}
                  className="send-modal-btn send"
                  onClick={async () => {
                    if (!sendToUser) return;
                    for (const examId of selectedExams) {
                      const examRef = doc(db, 'exams', examId);
                      await updateDoc(examRef, {
                        assignedTo: arrayUnion(sendToUser)
                      });
                    }
                    setShowMultiSendModal(false);
                    setSendToUser('');
                  }}
                >
                  Send
                </button>
                <button
                  className="send-modal-btn cancel"
                  onClick={() => {
                    setShowMultiSendModal(false);
                    setSendToUser('');
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
  const takenExamIds = results.map(r => r.examId);
  const assignedExams = exams.filter(exam => !takenExamIds.includes(exam.id));
  const takenExams = exams.filter(exam => takenExamIds.includes(exam.id));

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
          {assignedExams.length === 0 ? (
            <li style={{ color: '#888', fontSize: 18 }}>No exams assigned to you yet.</li>
          ) : (
            assignedExams.map(exam => (
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
                  transition: 'box-shadow 0.2s, background 0.2s, border 0.2s'
                }}
                onClick={() => navigate(`/exams/${exam.id}/take`)}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#e3e8f7';
                  e.currentTarget.style.boxShadow = '0 4px 16px #b0bec5';
                  e.currentTarget.style.border = '2px solid #1976d2';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#f5f7fa';
                  e.currentTarget.style.boxShadow = '0 2px 8px #e3e3e3';
                  e.currentTarget.style.border = 'none';
                }}
              >
                <strong>{exam.title}</strong>
                <div style={{ color: '#1976d2', fontSize: 15 }}>{exam.description}</div>
              </li>
            ))
          )}
        </ul>
      )}
      {/* Taken Exams Section */}
      <h2 style={{ color: '#388e3c', fontWeight: 800, margin: '32px 0 18px 0' }}>Taken Exams</h2>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {takenExams.length === 0 ? (
          <li style={{ color: '#888', fontSize: 18 }}>No taken exams yet.</li>
        ) : (
          takenExams.map(exam => (
            <li
              key={exam.id}
              style={{
                background: '#e8f5e9',
                borderRadius: 10,
                padding: '14px 18px',
                marginBottom: 12,
                fontSize: 18,
                color: '#22223b',
                boxShadow: '0 2px 8px #e3e3e3',
                cursor: 'not-allowed',
                opacity: 0.7,
                border: '2px solid #43a047',
                position: 'relative'
              }}
              title="You have already taken this exam"
            >
              <strong>{exam.title}</strong>
              <div style={{ color: '#388e3c', fontSize: 15, fontWeight: 700 }}>Already taken</div>
              <div style={{ color: '#1976d2', fontSize: 15 }}>{exam.description}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}