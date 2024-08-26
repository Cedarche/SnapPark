// Import the functions you need from the SDKs you need

import {
  doc,
  getDoc,
  collection,
  getDocs,
  FirestoreError,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

export const fetchAndCombineOfficeData = async (officeDocRef: any) => {
  const publicDocRef = doc(officeDocRef, "public", officeDocRef.id);
  const privateDocRef = doc(officeDocRef, "private", officeDocRef.id);

  // Get public and private documents
  const [publicDoc, privateDoc] = await Promise.all([
    getDoc(publicDocRef),
    getDoc(privateDocRef),
  ]);

  // Combine the data from public and private documents into one object
  const combinedData = {
    ...publicDoc.data(), // Spread the public data first
    ...privateDoc.data(), // Spread the private data; properties in private can overwrite public if they overlap
  };

  // console.log("Combined Data: ", combinedData);

  return {
    id: officeDocRef.id,
    data: combinedData,
  };
};

export const getCompanyData = (
  userId: string,
  onDataReceived: (data: any) => void, // Changed the type to 'any' for simplicity
): (() => void) => {
  const userDocRef = doc(db, "users", userId);

  const unsubscribe = onSnapshot(
    userDocRef,
    async (docSnapshot) => {
      // Made the callback async
      if (docSnapshot.exists()) {
        // console.log("Getting data...");

        const userData = { id: docSnapshot.id, data: docSnapshot.data() };
        const officesCollectionRef = collection(userDocRef, "offices");
        const invoicesCollectionRef = collection(userDocRef, "invoices");
        const usageCollectionRef = collection(userDocRef, "usage");

        try {
          // console.log("Fetching offices...");
          const officeDocsSnapshot = await getDocs(officesCollectionRef);
          // console.log(`Retrieved ${officeDocsSnapshot.docs.length} office(s).`);

          const officesPromise = officeDocsSnapshot.docs.map((officeDoc) =>
            fetchAndCombineOfficeData(officeDoc.ref),
          );
          const offices = await Promise.all(officesPromise);

          const invoiceSnapshot = await getDocs(invoicesCollectionRef);
          const invoices = invoiceSnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));

          const usageSnapshot = await getDocs(usageCollectionRef);
          const usage = usageSnapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));

          // Combine user data with the merged office, invoices, and usage data
          onDataReceived({ ...userData, offices, invoices, usage });
        } catch (error) {
          console.error("Error retrieving offices:", error);
          onDataReceived({ ...userData, offices: [], invoices: [], usage: [] });
        }
      } else {
        console.log("No such document!");
        onDataReceived(undefined);
      }
    },
    (error: FirestoreError) => {
      console.error("Error listening to user document:", error);
    },
  );

  return unsubscribe;
};
