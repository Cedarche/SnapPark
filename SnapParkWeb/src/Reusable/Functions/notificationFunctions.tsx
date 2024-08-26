import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import axios from "axios";
import { db } from "@/firebase";
import { Employee } from "../Types/types";


export const addToNotificationList = async (
  userId: string,
  officeId: string,
  newEmployee: {
    name: string;
    mobile: string;
    office: string;
    notifications: boolean;
  },
) => {
  try {
    // Direct reference to the private subdocument of the office
    const officePrivateRef = doc(
      db,
      `users/${userId}/offices/${officeId}/private/${officeId}`,
    );

    const officeDoc = await getDoc(officePrivateRef);

    if (!officeDoc.exists()) {
      console.log("Office document does not exist");
      return; // Exit if the office document doesn't exist
    }

    const officeData = officeDoc.data();

    // Check for existing employee by name or mobile in the notificationList
    const existingEmployeeIndex = officeData.notificationList?.findIndex(
      (employee: { name: string; mobile: string }) =>
        employee.name === newEmployee.name ||
        employee.mobile === newEmployee.mobile,
    );

    if (existingEmployeeIndex !== -1) {
      console.log("Employee already exists in the notification list.");
      return; // Exit if employee already exists
    }

    // Proceed to add the new employee to the notificationList
    await updateDoc(officePrivateRef, {
      notificationList: arrayUnion(newEmployee),
    });

    const officeURL = `snappark.co/all/${userId}/${officeId}/addEmployee`;
    const employeeMobile = newEmployee?.mobile;
    const url = import.meta.env.VITE_CONFIRM_EMPLOYEE_URL;
    const response = await axios.post(url, {
      userID: userId,
      officeID: officeId,
      officeURL: officeURL,
      employeeMobile: employeeMobile,
    });

    if (!response.data || !response.data.subscriptionId) {
      throw new Error("Failed to send out employee notification text");
    }

    console.log("Employee added successfully to the notification list.");
  } catch (error) {
    console.error("Error adding employee to notification list: ", error);
  }
};

export const removeFromNotificationList = async (
  userId: string,
  officeId: string,
  employeeIdentifier: {
    name?: string;
    mobile?: string;
  },
) => {
  try {
    // Direct reference to the private subdocument of the office
    const officePrivateRef = doc(
      db,
      `users/${userId}/offices/${officeId}/private/${officeId}`,
    );

    const officeDoc = await getDoc(officePrivateRef);

    if (!officeDoc.exists()) {
      console.log("Office document does not exist");
      return; // Exit if the office document doesn't exist
    }

    const officeData = officeDoc.data();

    // Find the employee to remove by name or mobile in the notificationList
    const employeeToRemove = officeData.notificationList?.find(
      (employee: { name?: string; mobile?: string }) =>
        employee.name === employeeIdentifier.name ||
        employee.mobile === employeeIdentifier.mobile,
    );

    if (!employeeToRemove) {
      console.log("Employee does not exist in the notification list.");
      return; // Exit if employee does not exist
    }

    // Proceed to remove the employee from the notificationList
    await updateDoc(officePrivateRef, {
      notificationList: arrayRemove(employeeToRemove),
    });

    console.log("Employee removed successfully from the notification list.");
  } catch (error) {
    console.error("Error removing employee from notification list: ", error);
  }
};

export const toggleEmployeeNotification = async (
  userId: string,
  officeId: string,
  employeeMobile: string,
) => {
  try {
    // Reference to the user's document in the 'users' collection
    const userDocRef = doc(db, "users", userId);

    // Direct reference to the specific office document using officeId
    const officeDocRef = doc(
      userDocRef,
      "offices",
      officeId,
      "private",
      officeId,
    );

    // Get the office document
    const officeDocSnap = await getDoc(officeDocRef);

    // Check if the office document exists
    if (!officeDocSnap.exists()) {
      console.log("No matching office found");
      return; // Exit if no office found
    }

    const officeDoc = officeDocSnap.data();

    // Ensure officeDoc.notificationList is treated as an array of Employee
    const notificationList: Employee[] = officeDoc.notificationList || [];

    // Find the employee in the notificationList using their mobile number and toggle their 'notifications' value
    const modifiedNotificationList = notificationList.map(
      (employee: Employee) => {
        if (employee.mobile === employeeMobile) {
          // Compare with employee's mobile number
          return { ...employee, notifications: !employee.notifications }; // Toggle the 'notifications' value
        }
        return employee;
      },
    );

    // Update the office document with the modified notificationList
    await updateDoc(officeDocRef, {
      notificationList: modifiedNotificationList,
    });

    // console.log(
    //   "Notification status toggled successfully for employee with mobile:",
    //   employeeMobile,
    // );
  } catch (error) {
    // Handle any errors
    console.error(
      "Error toggling notification status for mobile: ",
      employeeMobile,
      error,
    );
  }
};
