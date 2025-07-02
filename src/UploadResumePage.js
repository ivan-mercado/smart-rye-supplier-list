import React, { useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UploadResumePage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file.");
    setUploading(true);
    setMessage("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const storage = getStorage();
      const storageRef = ref(storage, `resumes/${user.uid}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        },
        (error) => {
          setMessage("Upload failed: " + error.message);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "resumes"), {
            userId: user.uid,
            userEmail: user.email,
            fileName: file.name,
            fileUrl: downloadURL,
            uploadedAt: serverTimestamp(),
          });
          setMessage("Resume uploaded successfully!");
          setUploading(false);
          setFile(null);
          setPreview("");
          setProgress(0);
        }
      );
    } catch (err) {
      setMessage("Error: " + err.message);
      setUploading(false);
    }
  };
    return (
    <div className="resume-upload-root">
      <style>
        {`
        .resume-upload-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e3f0ff 0%, #f9fbfc 100%);
        }
        .resume-upload-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px #cfd8dc;
          padding: 32px 20px 24px 20px;
          max-width: 370px;
          width: 94vw;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .resume-back-btn {
          background: #1976d2;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px #e3e3e3;
          transition: background 0.18s;
          align-self: flex-start;
        }
        .resume-back-btn:active {
          background: #1251a3;
        }
        .resume-upload-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1976d2;
          margin-bottom: 10px;
          text-align: center;
        }
        .resume-upload-desc {
          font-size: 1rem;
          color: #22223b;
          margin-bottom: 18px;
          text-align: center;
        }
        .resume-upload-input {
          margin-bottom: 16px;
          width: 100%;
        }
        .resume-upload-preview {
          margin-bottom: 16px;
          max-width: 180px;
          max-height: 180px;
          border-radius: 10px;
          box-shadow: 0 2px 8px #e3e3e3;
        }
        .resume-upload-btn {
          background: linear-gradient(90deg, #1976d2 0%, #43a047 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 24px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 10px;
          width: 100%;
        }
        .resume-upload-progress {
          width: 100%;
          margin-bottom: 10px;
        }
        .resume-upload-message {
          color: #43a047;
          font-weight: 600;
          margin-bottom: 8px;
        }
        @media (max-width: 600px) {
          .resume-upload-card {
            padding: 18px 6vw 14px 6vw;
            max-width: 98vw;
          }
          .resume-back-btn {
            width: 100%;
            align-self: stretch;
            margin-bottom: 14px;
          }
        }
        `}
      </style>
            <form className="resume-upload-card" onSubmit={handleSubmit}>
        <button
          type="button"
          className="resume-back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Main Menu
        </button>
        <div className="resume-upload-title">Upload Your Resume</div>
        <div className="resume-upload-desc">
          Select a PDF or image file, or use your camera to take a photo of your resume.
        </div>
        <input
          className="resume-upload-input"
          type="file"
          accept="application/pdf,image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {preview && (
          <img src={preview} alt="Preview" className="resume-upload-preview" />
        )}
        {progress > 0 && uploading && (
          <progress className="resume-upload-progress" value={progress} max="100" />
        )}
        {message && (
          <div className="resume-upload-message">{message}</div>
        )}
        <button className="resume-upload-btn" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>
    </div>
  );
}