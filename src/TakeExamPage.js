import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { collection, addDoc } from "firebase/firestore";
import { getDocs, query, where } from "firebase/firestore";

const noSelectStyle = `
  .no-select, .no-select * {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }
`;

const likertLabels = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
];

export default function TakeExamPage({ user }) {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isMobile = window.innerWidth < 700;
  const localKey = `exam-${user.uid}-${examId}-answers`;

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = noSelectStyle;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    const fetchExam = async () => {
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        setExam({ id: examSnap.id, ...examSnap.data() });
        const saved = localStorage.getItem(localKey);
        if (saved) {
          setAnswers(JSON.parse(saved));
        } else {
          setAnswers(Array(examSnap.data().questions.length).fill(''));
        }
      } else {
        navigate('/exams');
      }
    };
    fetchExam();
  }, [examId, navigate, localKey]);

  useEffect(() => {
    if (answers.length > 0) {
      localStorage.setItem(localKey, JSON.stringify(answers));
    }
  }, [answers, localKey]);

  useEffect(() => {
    if (submitted) {
      localStorage.removeItem(localKey);
    }
  }, [submitted, localKey]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!exam) return <div style={{ textAlign: 'center', marginTop: 80 }}>Loading exam...</div>;
    return (
    <div
      className="no-select"
      style={{
        minHeight: '100vh',
        background: '#f5f7fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? 0 : undefined,
      }}
    >
      {!isOnline && (
        <div style={{color: 'red', fontWeight: 700, marginTop: 16, marginBottom: 10}}>
          You are offline! Your answers are being saved locally. Please reconnect before submitting.
        </div>
      )}
      {!nameEntered ? (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <h2>Please enter your full name to begin the exam</h2>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Full Name (LN, FN, MN)"
            style={{
              padding: 12,
              fontSize: 18,
              borderRadius: 8,
              border: '1.5px solid #b0bec5',
              marginRight: 12,
              width: isMobile ? '90%' : 300,
              marginBottom: isMobile ? 16 : 0
            }}
          />
          <button
            onClick={() => {
              if (fullName.trim()) setNameEntered(true);
            }}
            style={{
              padding: isMobile ? '12px 0' : '10px 24px',
              width: isMobile ? '90%' : undefined,
              fontWeight: 700,
              borderRadius: 8,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              fontSize: 18
            }}
          >
            Start Exam
          </button>
        </div>
      ) : (
        <>
          {/* Top Bar */}
          <div style={{
            background: '#1976d2',
            color: '#fff',
            padding: isMobile ? '14px 10px' : '18px 32px',
            fontWeight: 800,
            fontSize: isMobile ? 18 : 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
            borderRadius: isMobile ? 0 : 18,
            marginBottom: isMobile ? 0 : 0
          }}>
            <span>{exam.title}</span>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            width: '100%',
            maxWidth: 900,
            margin: isMobile ? '0 auto' : undefined,
            minHeight: isMobile ? 0 : 500,
            background: isMobile ? 'transparent' : '#fff',
            borderRadius: isMobile ? 0 : 18,
            boxShadow: isMobile ? 'none' : '0 8px 32px #cfd8dc'
          }}>
            {/* Question Navigation */}
            <div style={{
              minWidth: isMobile ? '100%' : 110,
              width: isMobile ? '100%' : 110,
              background: '#e3e8f7',
              borderRight: isMobile ? 'none' : '1.5px solid #b0bec5',
              borderBottom: isMobile ? '1.5px solid #b0bec5' : 'none',
              padding: isMobile ? '10px 0' : '24px 10px',
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'center',
              overflowX: isMobile ? 'auto' : 'visible',
              gap: 8,
              whiteSpace: isMobile ? 'nowrap' : 'normal',
              scrollBehavior: isMobile ? 'smooth' : undefined,
            }}>
              <div style={{
                fontWeight: 700,
                color: '#1976d2',
                marginBottom: isMobile ? 0 : 10,
                fontSize: isMobile ? 14 : 15,
                marginRight: isMobile ? 10 : 0
              }}>
                Questions
              </div>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                gap: 8
              }}>
                {exam.questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQ(idx)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      border: currentQ === idx ? '2.5px solid #1976d2' : '1.5px solid #b0bec5',
                      background: answers[idx] ? '#43a047' : '#fff',
                      color: answers[idx] ? '#fff' : '#1976d2',
                      fontWeight: 700,
                      fontSize: 17,
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={answers[idx] ? 'Answered' : 'Not Answered'}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
            {/* Main: Question and Options */}
            <div style={{
              flex: 1,
              padding: isMobile ? '18px 8px' : '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 400,
              position: 'relative'
            }}>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 17 : 19, marginBottom: 10 }}>
                Question {currentQ + 1} of {exam.questions.length}
              </div>
              <div style={{ fontSize: isMobile ? 16 : 18, marginBottom: 18 }}>
                {exam.questions[currentQ].question}
              </div>
              {/* Render input based on type */}
              {exam.questions[currentQ].type === 'text' && (
                <input
                  type="text"
                  value={answers[currentQ]}
                  onChange={e => {
                    const newAns = [...answers];
                    newAns[currentQ] = e.target.value;
                    setAnswers(newAns);
                  }}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 8,
                    border: '1.5px solid #b0bec5',
                    fontSize: isMobile ? 15 : 17,
                    background: '#fff',
                    marginBottom: 18
                  }}
                  disabled={submitting || submitted}
                />
              )}
              {exam.questions[currentQ].type === 'mcq' && (
                <div style={{ marginBottom: 18 }}>
                  {exam.questions[currentQ].options.map((opt, oidx) => (
                    <label key={oidx} style={{
                      display: 'block',
                      background: '#f5f7fa',
                      borderRadius: 8,
                      padding: isMobile ? '8px 10px' : '10px 16px',
                      marginBottom: 8,
                      fontSize: isMobile ? 15 : 16,
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name={`mcq-${currentQ}`}
                        value={oidx}
                        checked={answers[currentQ] === String(oidx)}
                        onChange={() => {
                          const newAns = [...answers];
                          newAns[currentQ] = String(oidx);
                          setAnswers(newAns);
                        }}
                        disabled={submitting || submitted}
                        style={{ marginRight: 10 }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
              {exam.questions[currentQ].type === 'likert' && (
                <div style={{ marginBottom: 18, display: 'flex', gap: isMobile ? 8 : 18 }}>
                  {likertLabels.map((label, i) => (
                    <label key={i} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 15
                    }}>
                      <input
                        type="radio"
                        name={`likert-${currentQ}`}
                        value={i + 1}
                        checked={answers[currentQ] === String(i + 1)}
                        onChange={() => {
                          const newAns = [...answers];
                          newAns[currentQ] = String(i + 1);
                          setAnswers(newAns);
                        }}
                        disabled={submitting || submitted}
                      />
                      <span style={{ marginTop: 4 }}>{i + 1}</span>
                      <span style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{label}</span>
                    </label>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
  <button
    type="button"
    onClick={() => setCurrentQ(currentQ - 1)}
    disabled={currentQ === 0}
    style={{
      background: '#fff',
      color: '#1976d2',
      border: '2px solid #1976d2',
      borderRadius: 8,
      padding: isMobile ? '10px 0' : '10px 18px',
      width: isMobile ? '100%' : undefined,
      fontWeight: 700,
      fontSize: isMobile ? 16 : 16,
      cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
      opacity: currentQ === 0 ? 0.6 : 1,
    }}
  >
    Back
  </button>
  <button
    type="button"
    onClick={() => {
      if (currentQ < exam.questions.length - 1) setCurrentQ(currentQ + 1);
    }}
    disabled={submitting || submitted || currentQ === exam.questions.length - 1}
    style={{
      background: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: isMobile ? '10px 0' : '10px 18px',
      width: isMobile ? '100%' : undefined,
      fontWeight: 700,
      fontSize: isMobile ? 16 : 16,
      cursor: 'pointer'
    }}
  >
    Save & Next
  </button>
</div>
                            {/* Finish Exam Button - lower right */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (submitting) return;
                  setShowConfirm(true);
                }}
                style={{
                  marginTop: 30,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}
              >
                {!submitted ? (
                  <button
                    type="submit"
                    disabled={submitting || !isOnline}
                    style={{
                      background: '#43a047',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: isMobile ? '14px 0' : '14px 32px',
                      fontWeight: 700,
                      fontSize: isMobile ? 17 : 19,
                      cursor: (submitting || !isOnline) ? 'not-allowed' : 'pointer',
                      marginTop: 10,
                      minWidth: isMobile ? '100%' : 180
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Finish Exam'}
                  </button>
                ) : (
                  <div style={{ color: '#43a047', fontWeight: 700, fontSize: 18, marginTop: 16 }}>
                    Exam submitted! Redirecting...
                  </div>
                )}
              </form>
              {/* Custom Confirmation Modal */}
              {showConfirm && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.25)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setShowConfirm(false)}
                >
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: 16,
                      boxShadow: '0 8px 32px #cfd8dc',
                      padding: '32px 28px 24px 28px',
                      minWidth: 320,
                      maxWidth: '90vw',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                    onClick={e => e.stopPropagation()}
                    tabIndex={-1}
                  >
                    <div style={{ fontSize: 38, color: '#d32f2f', marginBottom: 12 }}>⚠️</div>
                    <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10, color: '#222' }}>
                      Finish Exam?
                    </div>
                    <div style={{ color: '#555', fontSize: 16, marginBottom: 24 }}>
                      Are you sure you want to finish the exam?<br />
                      <span style={{ color: '#d32f2f', fontWeight: 600 }}>
                        You won't be able to change your answers after this.
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                      <button
                        onClick={() => setShowConfirm(false)}
                        style={{
                          background: '#b0bec5',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 28px',
                          fontWeight: 700,
                          fontSize: 16,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setShowConfirm(false);
                          setSubmitting(true);
                          // Use setDoc with a unique ID per user/exam
                          await setDoc(doc(db, 'results', `${user.uid}_${exam.id}`), {
                            examId: exam.id,
                            userId: user.uid,
                            userName: fullName,
                            answers,
                            submittedAt: serverTimestamp()
                          });
                          const adminsSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "admin")));
for (const adminDoc of adminsSnapshot.docs) {
  try {
    await addDoc(collection(db, "notifications"), {
      toUserId: adminDoc.id,
      type: "exam_submitted",
      examId: exam.id,
      examTitle: exam.title,
      fromUserName: fullName,
      timestamp: serverTimestamp(),
      read: false,
    });
    console.log("Notification sent to admin:", adminDoc.id);
  } catch (err) {
    console.error("Failed to send notification to admin:", adminDoc.id, err);
  }
}
                          setSubmitting(false);
                          setSubmitted(true);
                          setTimeout(() => navigate('/exams'), 1200);
                        }}
                        style={{
                          background: '#43a047',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          padding: '10px 28px',
                          fontWeight: 700,
                          fontSize: 16,
                          cursor: 'pointer'
                        }}
                        disabled={!isOnline}
                      >
                        Finish Exam
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}