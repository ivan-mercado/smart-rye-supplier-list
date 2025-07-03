import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const likertLabels = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
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
  const [viewResult, setViewResult] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const navigate = useNavigate();

  function calculateScore(questions, answers) {
    let score = 0;
    questions.forEach((q, idx) => {
      if (q.type === 'likert') {
        score++;
      } else if (q.type === 'mcq') {
        const correctIdx = q.options.findIndex(opt => opt === q.correctAnswer);
        if (String(correctIdx) === answers[idx]) score++;
      } else if (q.type === 'text') {
        if (
          answers[idx] &&
          q.correctAnswer &&
          answers[idx].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
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
    setResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
    setSelectedResults(prev => prev.filter(id => snapshot.docs.some(doc => doc.id === id)));
  };

  useEffect(() => {
    refetchResults();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    const fetchExams = async () => {
      const snapshot = await getDocs(collection(db, 'exams'));
      const titles = {};
      snapshot.docs.forEach(doc => {
        titles[doc.id] = doc.data().title;
      });
      setExamTitles(titles);
    };
    fetchExams();
  }, []);

  const filteredResults = results.filter(result => {
    const nameMatch = (result.userName || result.userId).toLowerCase().includes(search.toLowerCase());
    const examMatch = examFilter ? result.examId === examFilter : true;
    const dateMatch = dateFilter
      ? result.submittedAt?.toDate?.().toLocaleDateString?.() === dateFilter
      : true;
    return nameMatch && examMatch && dateMatch;
  });
    return (
    <div style={{ maxWidth: 1100, margin: '40px auto', background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px #cfd8dc', padding: 32, minHeight: 400 }}>
      <style>
        {`
        .answers-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.18);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .answers-modal {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px #cfd8dc;
          max-width: 480px;
          width: 96vw;
          max-height: 90vh;
          padding: 24px 18px 18px 18px;
          overflow-y: auto;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .answers-modal-close {
          background: #1976d2;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 18px;
          align-self: flex-end;
        }
        .score-badge-modal {
          position: absolute;
          right: 32px;
          bottom: 24px;
          background: #fff;
          color: #1976d2;
          border-radius: 50%;
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 32px;
          box-shadow: 0 2px 8px #b0bec5;
          border: 6px solid #1976d2;
          z-index: 2;
        }
        @media (max-width: 600px) {
          .answers-modal {
            max-width: 99vw;
            padding: 12px 4vw 10px 4vw;
          }
          .answers-modal-close {
            width: 100%;
            margin-bottom: 12px;
          }
          .score-badge-modal {
            right: 10px;
            bottom: 10px;
            width: 80px;
            height: 80px;
            font-size: 30px;
            border-width: 4px;
          }
        }
        `}
      </style>
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
      <h2 style={{
        color: '#1976d2',
        fontWeight: 800,
        marginBottom: 32,
        fontSize: 28,
        letterSpacing: 1
      }}>
        Examination Results
      </h2>
      <div style={{ marginBottom: 12 }}>
        {!deleteMode ? (
          <button
            onClick={() => setDeleteMode(true)}
            style={{
              background: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: 16,
              marginRight: 12,
              cursor: 'pointer'
            }}
          >
            Delete Result
          </button>
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
              style={{
                background: selectedResults.length === 0 ? '#b0bec5' : '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontWeight: 700,
                fontSize: 16,
                marginRight: 8,
                cursor: selectedResults.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Confirm Delete
            </button>
            <button
              onClick={() => {
                setDeleteMode(false);
                setSelectedResults([]);
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
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1.5px solid #b0bec5',
            fontSize: 16,
            minWidth: 180
          }}
        />
        <select
          value={examFilter}
          onChange={e => setExamFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1.5px solid #b0bec5',
            fontSize: 16,
            minWidth: 180
          }}
        >
          <option value="">All Exams</option>
          {Object.entries(examTitles).map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1.5px solid #b0bec5',
            fontSize: 16
          }}
        />
        <button
          onClick={() => {
            setSearch('');
            setExamFilter('');
            setDateFilter('');
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: '#e3e8f7',
            color: '#1976d2',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer'
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: 17,
            background: '#f8fafc',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 2px 8px #e3e3e3'
          }}>
            <thead>
              <tr style={{
                background: '#e3e8f7',
                color: '#1976d2',
                fontWeight: 800,
                fontSize: 18
              }}>
                {deleteMode && <th style={{ width: 40 }}></th>}
                <th style={{ textAlign: 'left', padding: '14px 18px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '14px 18px' }}>Exam</th>
                <th style={{ textAlign: 'left', padding: '14px 18px' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '14px 18px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '14px 18px' }}>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, idx) => (
                <tr
                  key={result.id}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#f5f7fa',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#e3e8f7'}
                  onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f5f7fa'}
                >
                  {deleteMode && (
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedResults.includes(result.id)}
                        onChange={e => {
                          setSelectedResults(prev =>
                            e.target.checked
                              ? [...prev, result.id]
                              : prev.filter(id => id !== result.id)
                          );
                        }}
                      />
                    </td>
                  )}
                  <td style={{ padding: '12px 18px', fontWeight: 600 }}>
                    {result.userName || result.userId}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    {examTitles[result.examId] || result.examId}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    {result.submittedAt?.toDate?.().toLocaleString?.() || ''}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                    <span style={{
                      background: '#43a047',
                      color: '#fff',
                      borderRadius: 6,
                      padding: '4px 14px',
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: 1
                    }}>
                      Completed
                    </span>
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                    <button
                      onClick={async () => {
                        setShowAnswers(false);
                        setViewResult(result);
                        // Fetch exam questions for this result
                        const examSnap = await getDocs(query(collection(db, 'exams'), where('__name__', '==', result.examId)));
                        if (!examSnap.empty) {
                          setExamQuestions(examSnap.docs[0].data().questions);
                        } else {
                          setExamQuestions([]);
                        }
                      }}
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '7px 18px',
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px #e3e3e3'
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
          onClick={() => setViewResult(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: '0 0 32px 0',
              minWidth: 400,
              maxWidth: 480,
              boxShadow: '0 8px 32px #cfd8dc',
              position: 'relative',
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              background: '#1976d2',
              color: '#fff',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: '20px 32px 16px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                Candidate: <span style={{ fontWeight: 600 }}>{viewResult.userName || viewResult.userId}</span>
              </div>
              <button
                onClick={() => setViewResult(null)}
                style={{
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 16px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  marginLeft: 12
                }}
              >
                Close
              </button>
            </div>
            {/* Score Badge in lower right */}
            <div className="score-badge-modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
              {calculateScore(examQuestions, viewResult.answers)}
              <span style={{ fontSize: 22, fontWeight: 700, margin: '0 2px' }}>/</span>
              {examQuestions.length}
            </div>
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
              {showAnswers && (
                <div className="answers-modal-overlay">
                  <div className="answers-modal" onClick={e => e.stopPropagation()}>
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}