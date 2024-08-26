import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { setOfficesState } from "../RecoilState";
import { doc, onSnapshot, collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { OfficeData } from "../Types/types";


export function useSetOffices() {
  const [officesData, setOfficesData] = useRecoilState<OfficeData[]>(setOfficesState);
  const [loading, setLoading] = useState<boolean>(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !user.uid) return;

    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    const setupDataListener = (officeRef: QueryDocumentSnapshot<DocumentData>, subcollection: string) => {
      return onSnapshot(doc(officeRef.ref, subcollection, officeRef.id), (docSnapshot) => {
        const newData = docSnapshot.data();
        if (!newData) return;

        setOfficesData((prevOffices) => {
          const updatedOffices = prevOffices.map((office) => {
            if (office.id === officeRef.id) {
              return {
                ...office,
                data: {
                  ...office.data,
                  ...newData, // Merge or overwrite the existing office data with new data from public or private subcollection
                },
              };
            }
            return office;
          });
          return updatedOffices;
        });
      }, (error) => {
        console.error(`Error listening to ${subcollection} data for office ${officeRef.id}: `, error);
      });
    };

    const fetchActivityData = async (officeRef: QueryDocumentSnapshot<DocumentData>) => {
      try {
        const activityDocs = await getDocs(collection(officeRef.ref, "activity"));
        const allActivity = activityDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setOfficesData((prevOffices) => {
          const updatedOffices = prevOffices.map((office) => {
            if (office.id === officeRef.id) {
              return {
                ...office,
                data: {
                  ...office.data,
                  allActivity, // Add the allActivity array to the office data
                },
              };
            }
            return office;
          });
          return updatedOffices;
        });
      } catch (error) {
        console.error(`Error fetching activity data for office ${officeRef.id}: `, error);
      }
    };

    const unsubscribeMain = onSnapshot(
      collection(db, `users/${user.uid}/offices`),
      (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const officeRef = change.doc;
            const newOfficeData: OfficeData = {
              id: change.doc.id,
              data: change.doc.data(), // Initially empty or minimal data
            };
            setOfficesData((prev) => [...prev, newOfficeData]);
            unsubscribes.push(setupDataListener(officeRef, "public"));
            unsubscribes.push(setupDataListener(officeRef, "private"));
            unsubscribes.push(setupDataListener(officeRef, "activity"));

            // Fetch activity data if the subcollection exists
            fetchActivityData(officeRef);
          } else if (change.type === "removed") {
            setOfficesData((prev) => prev.filter((office) => office.id !== change.doc.id));
          }
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to offices collection: ", error);
        setLoading(false);
      }
    );
    unsubscribes.push(unsubscribeMain);

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe()); // Clean up all listeners
    };
  }, [user, setOfficesData]); // Dependency on 'user' to handle changes in authentication

  return { officesData, loading }; // Return loading state as well
}
