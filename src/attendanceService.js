import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getPHDate, getPHTime } from './phTimeUtils';

export async function addTimeIn(user) {
  const date = getPHDate();
  const timeIn = getPHTime();
  const attendanceRef = doc(collection(db, "attendance"), `${user.uid}_${date}`);
  const docSnap = await getDoc(attendanceRef);

  if (!docSnap.exists()) {
    const status = timeIn > "08:30:00" ? "Late" : "Present";
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