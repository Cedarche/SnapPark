import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { officeSettingsState } from "../RecoilState";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/firebase";

export function useOfficeSettings(officeId: string) {
  const [settings, setSettings] = useRecoilState(officeSettingsState);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !officeId) return;

    // Define references to public and private documents
    const publicDocRef = doc(
      db,
      "users",
      user.uid,
      "offices",
      officeId,
      "public",
      officeId,
    );
    const privateDocRef = doc(
      db,
      "users",
      user.uid,
      "offices",
      officeId,
      "private",
      officeId,
    );

    // Snapshot listener for public data
    const unsubscribePublic = onSnapshot(
      publicDocRef,
      (doc) => {
        const publicData = doc.data();
        if (publicData) {
          setSettings((prevSettings) => ({
            ...prevSettings,
            notificationSettings: {
              ...prevSettings.notificationSettings,
              ...publicData.notificationSettings,
            },
            officeName: publicData.office || prevSettings.officeName, // update officeName
          }));
        }
      },
      (error) => console.error("Error fetching public office settings:", error),
    );

    // Snapshot listener for private data
    const unsubscribePrivate = onSnapshot(
      privateDocRef,
      (doc) => {
        const privateData = doc.data();
        if (privateData) {
          setSettings((prevSettings) => ({
            ...prevSettings,
            mobile: privateData.mobile ?? prevSettings.mobile,
            timezoneOffset: privateData.countryInfo?.timezoneOffset ?? 0,
          }));
        }
      },
      (error) =>
        console.error("Error fetching private office settings:", error),
    );

    // Clean up function to unsubscribe from both listeners
    return () => {
      unsubscribePublic();
      unsubscribePrivate();
    };
  }, [officeId, user]); // Dependencies include officeId and user to re-evaluate when they change

  return settings;
}
