import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import app from "./init";
import { UserData } from "@/interfaces/UserData";

const firestore = getFirestore(app);
const storage = getStorage(app);

export async function retrieveData(collectionName: string) {
  const snapshot = await getDocs(collection(firestore, collectionName));
  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return data || null;
}

export async function retrieveDataById(collectionName: string, id: string) {
  const snapshot = await getDoc(doc(firestore, collectionName, id));
  const data = snapshot.data();

  return data || null;
}

export async function retrieveDataByField(
  collectionName: string,
  field: string,
  value: string
) {
  const q = query(
    collection(firestore, collectionName),
    where(field, "==", value)
  );
  const snapshot = await getDocs(q);
  const data: Array<UserData> | null =
    snapshot.docs.length > 0
      ? snapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email,
          fullname: doc.data().fullname,
          phone: doc.data().phone,
          password: doc.data().password,
          ...doc.data(),
        }))
      : null;

  return data;
}

export async function updateData(
  collectionName: string,
  id: string,
  data: any,
  callback: ({ status }: { status: boolean }) => any
) {
  const docRef = doc(firestore, collectionName, id);
  return await updateDoc(docRef, data)
    .then(() => {
      return callback({ status: true });
    })
    .catch(() => {
      return callback({ status: false });
    });
}

export async function deleteData(
  collectionName: string,
  id: string,
  callback: ({ status }: { status: boolean }) => void
) {
  const docRef = doc(firestore, collectionName, id);
  return await deleteDoc(docRef)
    .then(() => {
      return callback({ status: true });
    })
    .catch(() => {
      return callback({ status: false });
    });
}

export async function uploadFile(userID: string, file: any) {
  if (file) {
    if (file.size < 1048576) {
      const newName = "profile." + file.name.split(".")[1];
      const storageRef = ref(storage, `images/${userID}/${newName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot: any) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error: any) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL: any) => {
            console.log("File available at", downloadURL);
          });
        }
      );
    } else {
      return false;
    }
  }

  return true;
}
