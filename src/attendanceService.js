import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getPHDate, getPHTime } from './phTimeUtils';

// Helper to determine status based on time in
function getStatusForTimeIn(timeIn) {
  // timeIn is a string like "HH:mm:ss"
  const [h, m, s] = timeIn.split(":").map(Number);
  if (h < 8 || (h === 8 && m === 0 && s === 0)) {
    return "Present";
  }
  if (h > 8 || (h === 8 && m >= 5)) {
    return "Late";
  }
  // Between 8:00:01 and 8:04:59 is still Present
  return "Present";
}

export async function addTimeIn(user) {
  const date = getPHDate();
  const timeIn = getPHTime();
  const attendanceRef = doc(collection(db, "attendance"), `${user.uid}_${date}`);
  const docSnap = await getDoc(attendanceRef);

  if (!docSnap.exists()) {
    const status = getStatusForTimeIn(timeIn);
    await setDoc(attendanceRef, {
      userId: user.uid,
      name: user.displayName || user.email,
      department: user.department || "",
      date,
      timeIn,
      timeOut: null,
      status,
    });
  }
}

export async function addTimeOut(user) {
  const date = getPHDate();
  const timeOut = getPHTime();
  const attendanceRef = doc(collection(db, "attendance"), `${user.uid}_${date}`);
  const docSnap = await getDoc(attendanceRef);

  if (docSnap.exists() && !docSnap.data().timeOut) {
    await updateDoc(attendanceRef, { timeOut });
  }
}