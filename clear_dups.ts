import { db } from "./src/config/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

async function clear() {
  const snap = await getDocs(collection(db, "stockCategories"));
  let seen = false;
  for (const d of snap.docs) {
    if (d.data().name.toLowerCase() === "paper") {
      if (!seen) {
        seen = true;
      } else {
        await deleteDoc(doc(db, "stockCategories", d.id));
        console.log("Deleted duplicate: " + d.id);
      }
    }
  }
}
clear();
