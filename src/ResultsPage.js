import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './ResultsPage.css';


const likertLabels = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree'
];

export default function ResultsPage({ user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examTitles, setExamTitles] = useState({});
  const [search, setSearch] = useState('');
  const [examFilter, setExamFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedResults, setSelectedResults] = useState([]);
  const [openCardName, setOpenCardName] = useState(null);
  const [selectedExaminee, setSelectedExaminee] = useState(null);
  const [viewResult, setViewResult] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = useNavigate();

  function calculateScore(questions, answers) {
    let score = 0;
    questions.forEach((q, idx) => {
      if (q.type === 'likert') {
        score++;
      } else if (q.type === 'mcq') {
        const correctIdx = q.options.findIndex(
          (opt) => opt === q.correctAnswer
        );
        if (String(correctIdx) === answers[idx]) score++;
      } else if (q.type === 'text') {
        if (
          answers[idx] &&
          q.correctAnswer &&
          answers[idx].trim().toLowerCase() ===
            q.correctAnswer.trim().toLowerCase()
        ) {
          score++;
        }
      }
    });
    return score;
  }

  const refetchResults = async () => {
    setLoading(true);
    let q = collection(db, 'results');
    if (user.role !== 'admin') {
      q = query(q, where('userId', '==', user.uid));
    }
    const snapshot = await getDocs(q);
    setResults(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
    setSelectedResults((prev) =>
      prev.filter((id) => snapshot.docs.some((doc) => doc.id === id))
    );
  };

  useEffect(() => {
    refetchResults();
  }, [user]);

  useEffect(() => {
    if (deleteMode && openCardName) {
      setSelectedExaminee(openCardName);
    }
  }, [deleteMode, openCardName]);

  useEffect(() => {
    const fetchExams = async () => {
      const snapshot = await getDocs(collection(db, 'exams'));
      const titles = {};
      snapshot.docs.forEach((doc) => {
        titles[doc.id] = doc.data().title;
      });
      setExamTitles(titles);
    };
    fetchExams();
  }, []);

  const filteredResults = results.filter((result) => {
    const nameMatch = (result.userName || result.userId)
      .toLowerCase()
      .includes(search.toLowerCase());
    const examMatch = examFilter ? result.examId === examFilter : true;
    const dateMatch = dateFilter
      ? result.submittedAt?.toDate?.().toLocaleDateString?.() === dateFilter
      : true;
    return nameMatch && examMatch && dateMatch;
  });

  const groupedResults = filteredResults.reduce((acc, result) => {
    const key = result.userName || result.userId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {});

  return (
    <div className="results-page">
      <div className="top-bar">
        <button onClick={() => navigate('/')}>← Back to Main Menu</button>
        <h2>Examination Results</h2>
        {!deleteMode ? (
          <button onClick={() => setDeleteMode(true)}>Delete Result</button>
        ) : (
          <>
            <button
              onClick={async () => {
                for (const resultId of selectedResults) {
                  await deleteDoc(doc(db, 'results', resultId));
                }
                setSelectedResults([]);
                setDeleteMode(false);
                await refetchResults();
              }}
              disabled={selectedResults.length === 0}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => {
                setDeleteMode(false);
                setSelectedExaminee(null);
                setSelectedResults([]);
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
        >
          <option value="">All Exams</option>
          {Object.entries(examTitles).map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <button
          onClick={() => {
            setSearch('');
            setExamFilter('');
            setDateFilter('');
          }}
        >
          Reset
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredResults.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="results-list">
          {Object.entries(groupedResults).map(([name, userResults], idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              key={idx}
              className="examinee-card"
            >
              <div
                className="card-header"
                onClick={() =>
                  setOpenCardName((prev) => (prev === name ? null : name))
                }
              >
                <h3>{name}</h3>
                <span>
                  {openCardName === name ? 'Hide Exams ▲' : 'View Exams ▼'}
                </span>
              </div>
              <AnimatePresence>
                {openCardName === name && (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="exam-list"
                  >
                    {userResults.map((result) => (
                      <div className="exam-item" key={result.id}>
                        <div className="exam-info">
                          <strong>
                            {examTitles[result.examId] || result.examId}
                          </strong>
                          <div>
                            {result.submittedAt?.toDate?.().toLocaleString?.() ||
                              ''}
                          </div>
                        </div>
                        <div className="exam-actions">
                          {deleteMode && selectedExaminee === name && (
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(result.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedResults((prev) => [
                                    ...prev,
                                    result.id
                                  ]);
                                } else {
                                  setSelectedResults((prev) =>
                                    prev.filter((id) => id !== result.id)
                                  );
                                }
                              }}
                            />
                          )}
                          <button
                            onClick={async () => {
                              setShowAnswers(false);
                              setViewResult(result);
                              const examSnap = await getDocs(
                                query(
                                  collection(db, 'exams'),
                                  where('__name__', '==', result.examId)
                                )
                              );
                              if (!examSnap.empty) {
                                setExamQuestions(
                                  examSnap.docs[0].data().questions
                                );
                              } else {
                                setExamQuestions([]);
                              }
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal and Answer viewer will go here, continue in next part */}
      {viewResult && (
  <div
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}
    onClick={() => {
      setViewResult(null);
      setShowAnswers(false);
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      style={{
        background: '#fff',
        borderRadius: 18,
        paddingBottom: 32,
        minWidth: 400,
        maxWidth: 500,
        width: '95vw',
        boxShadow: '0 8px 32px #cfd8dc',
        position: 'relative',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div style={{
        background: '#1976d2',
        color: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: '20px 32px 16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>
          Candidate: <span style={{ fontWeight: 600 }}>{viewResult.userName || viewResult.userId}</span>
        </div>
        <button
          onClick={() => {
            setViewResult(null);
            setShowAnswers(false);
          }}
          style={{
            background: '#d32f2f',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 16px',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>

      {/* Score Badge */}
      <div className="score-badge-modal">
        {calculateScore(examQuestions, viewResult.answers)} / {examQuestions.length}
      </div>

      {/* Exam Info and Toggle */}
      <div style={{ padding: '24px 32px 0 32px' }}>
        <div style={{ fontSize: 16, marginBottom: 6, color: '#1976d2', fontWeight: 700 }}>
          Exam: <span style={{ color: '#222', fontWeight: 600 }}>{examTitles[viewResult.examId] || viewResult.examId}</span>
        </div>
        <div style={{ fontSize: 15, marginBottom: 18, color: '#555' }}>
          Submitted: {viewResult.submittedAt?.toDate?.().toLocaleString?.() || ''}
        </div>
        <button
          onClick={() => setShowAnswers(s => !s)}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 22px',
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 18,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #e3e3e3'
          }}
        >
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </button>

        {/* Answers Panel */}
        {showAnswers && (
          <div className="answers-modal-overlay">
            <motion.div
              className="answers-modal"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="answers-modal-close"
                onClick={() => setShowAnswers(false)}
              >
                Hide Answers
              </button>

              <hr style={{ border: 'none', borderTop: '1.5px solid #e3e8f7', margin: '18px 0' }} />
              {examQuestions.length > 0 ? (
                <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                  {examQuestions.map((q, idx) => (
                    <li key={idx} style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4, color: '#1976d2' }}>
                        Q{idx + 1}: <span style={{ color: '#222', fontWeight: 600 }}>{q.question || q.text}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 2 }}>
                        <span style={{
                          background: '#e3e8f7',
                          color: '#1976d2',
                          borderRadius: 6,
                          padding: '3px 12px',
                          fontWeight: 600,
                          fontSize: 15
                        }}>
                          Your answer: {
                            q.type === 'mcq'
                              ? (q.options?.[Number(viewResult.answers?.[idx])] ?? <i>Not answered</i>)
                              : q.type === 'likert'
                                ? (
                                  viewResult.answers?.[idx]
                                    ? `${viewResult.answers[idx]} - ${likertLabels[Number(viewResult.answers[idx]) - 1]}`
                                    : <i>Not answered</i>
                                )
                                : (viewResult.answers?.[idx] ?? <i>Not answered</i>)
                          }
                        </span>
                        <span style={{
                          background: '#f5f5f5',
                          color: q.type === 'likert' ? '#388e3c' : '#43a047',
                          borderRadius: 6,
                          padding: '3px 12px',
                          fontWeight: 600,
                          fontSize: 15
                        }}>
                          {q.type === 'likert'
                            ? 'Always Correct'
                            : (
                              q.correctAnswer !== undefined && q.correctAnswer !== null && q.correctAnswer !== ""
                                ? `Correct Answer: ${q.correctAnswer}`
                                : <i>Not set</i>
                            )
                          }
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No questions found for this exam.</p>
              )}
              <div style={{
                marginTop: 18,
                fontWeight: 800,
                fontSize: 18,
                color: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                Score:
                <span style={{
                  background: '#e3e8f7',
                  color: '#1976d2',
                  borderRadius: 8,
                  padding: '6px 18px',
                  fontWeight: 800,
                  fontSize: 18
                }}>
                  {calculateScore(examQuestions, viewResult.answers)} / {examQuestions.length}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  </div>
)}

    </div>
  );
}
