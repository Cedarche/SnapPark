import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";

export const useUserNotificationStatus = (
  companyID: string,
  officeID: string,
  mobile: string,
) => {
  const [notifications, setNotifications] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = httpsCallable(
    functions,
    "fetchUserNotificationStatus",
  );

  useEffect(() => {
    const fetchUserNotificationStatus = async () => {
      if (companyID && officeID && mobile) {
        setLoading(true);
        try {
          const result = (await fetchNotifications({
            companyID,
            officeID,
            mobile,
          })) as any;
          if (result.data.exists && result.data.found) {
            setNotifications(result.data.notifications);
          } else {
            console.log("Employee not found in notification list.");
          }
        } catch (error) {
          console.error("Error fetching user's notification status:", error);
          alert("Failed to fetch notification status. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (companyID && officeID && mobile) {
      fetchUserNotificationStatus();
    }
  }, [companyID, officeID, mobile]);

  return { notifications,setNotifications, loading };
};
