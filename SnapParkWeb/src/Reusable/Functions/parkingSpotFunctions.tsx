import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "@/firebase";

interface ParkingSpot {
  name: string;
  available: boolean;
  office: string;
  utilisation: number;
}

interface OfficeData {
  company?: string;
  office?: string;
  parkingSpots?: {
    name: string;
    available: boolean;
    office: string;
    utilisation: number;
  }[];
  logoURL?: string;
  logoAlt?: string;
  messageSent?: boolean;
}
export const updateParkingSpots = async (
  userId: string,
  officeId: string,
  spotsArray: Array<{
    name: string;
    available: boolean;
    office: string;
    utilisation: number;
    createdAt?: any;
    totalUsedDays?: number;
    totalUnusedDays?: number;
  }>, // Adjust the type according to your actual data structure
) => {
  try {
    // Construct the direct reference to the public subcollection of the office document
    const officeRef = doc(
      db,
      `users/${userId}/offices/${officeId}/public/${officeId}`,
    );

    // Update the office document with the new array of parking spots
    await updateDoc(officeRef, {
      parkingSpots: spotsArray,
    });

    console.log("Parking spots updated successfully for office ID:", officeId);
  } catch (error) {
    // Handle any errors
    console.error("Error updating parking spots:", error);
  }
};

export const addParkingSpot = async (
  userId: string,
  officeId: string,
  newSpot: ParkingSpot,
) => {
  try {
    // Construct the direct reference to the public subcollection of the office document
    const officePublicRef = doc(
      db,
      `users/${userId}/offices/${officeId}/public/${officeId}`,
    );

    // Get the current data from the office document to check if the parking spot already exists
    const officeDocSnap = await getDoc(officePublicRef);

    if (!officeDocSnap.exists()) {
      console.log("Office document does not exist");
      return; // Exit if office document does not exist
    }

    const officeDocData = officeDocSnap.data();

    // Check if the newSpot.name already exists in the parkingSpots array
    const existingSpot = officeDocData.parkingSpots?.find(
      (spot: ParkingSpot) => spot.name === newSpot.name,
    );

    if (existingSpot) {
      console.log("Parking spot with this name already exists.");
      alert("Parking spot with this name already exists.");
      return; // Exit if the spot already exists
    }

    // Enhance newSpot with additional properties before adding it
    const enhancedNewSpot = {
      ...newSpot,
      createdAt: Date.now(), // Current timestamp in milliseconds
      totalUsedDays: 0, // Initialize total used days
      totalUnusedDays: 0, // Initialize total unused days
      lastToggledDate: "",
      utilisation: 0,
    };

    // If the spot does not exist, add the enhanced parking spot to the array
    await updateDoc(officePublicRef, {
      parkingSpots: arrayUnion(enhancedNewSpot),
    });
    console.log(enhancedNewSpot);
    console.log(
      "Parking spot added successfully to the office with ID:",
      officeId,
    );
  } catch (error) {
    // Handle any errors
    console.error("Error adding parking spot: ", error);
  }
};

export const updateParkingSpotName = async (
  userId: string,
  officeId: string,
  spotId: string, // Unique identifier for the parking spot by name
  newName: string,
) => {
  try {
    // Reference to the public subdocument of the office
    const officePublicRef = doc(
      db,
      `users/${userId}/offices/${officeId}/public/${officeId}`,
    );

    // Get the current data from the office document
    const officeDocSnap = await getDoc(officePublicRef);

    if (!officeDocSnap.exists()) {
      console.log("Office document does not exist");
      return; // Exit if office document does not exist
    }

    const officeDoc = officeDocSnap.data();

    // Check if there is a parking spot with the given name (spotId as name)
    const spotIndex = officeDoc.parkingSpots?.findIndex(
      (spot: ParkingSpot) => spot.name === spotId,
    );

    if (spotIndex === -1) {
      console.log("Parking spot with the given name not found.");
      return; // Exit if the spot with the given name doesn't exist
    }

    // Check if the new name already exists
    const nameExists = officeDoc.parkingSpots?.some(
      (spot: ParkingSpot) => spot.name === newName,
    );

    if (nameExists) {
      console.log("A parking spot with this new name already exists.");
      alert("A parking spot with this new name already exists.");
      return; // Exit if a spot with the new name already exists
    }

    // If the spot with the given name exists and the new name is unique, update the name
    const updatedParkingSpots = officeDoc.parkingSpots.map(
      (spot: ParkingSpot) =>
        spot.name === spotId ? { ...spot, name: newName } : spot,
    );

    // Update the document with the new array of parking spots
    await updateDoc(officePublicRef, {
      parkingSpots: updatedParkingSpots,
    });

    console.log("Parking spot name updated successfully.");
  } catch (error) {
    // Handle any errors
    console.error("Error updating parking spot name: ", error);
  }
};

export const deleteParkingSpot = async (
  userId: string,
  officeId: string,
  spotName: string,
) => {
  try {
    // Construct the direct reference to the public subdocument of the office
    const officePublicRef = doc(
      db,
      `users/${userId}/offices/${officeId}/public/${officeId}`,
    );

    // Get the current data from the office public document
    const officeDocSnap = await getDoc(officePublicRef);

    if (!officeDocSnap.exists()) {
      console.log("Office document does not exist");
      return; // Exit if office document does not exist
    }

    const officeDocData = officeDocSnap.data();

    // Find the parking spot by name in the parkingSpots array
    const spotToRemove = officeDocData.parkingSpots?.find(
      (spot: ParkingSpot) => spot.name === spotName,
    );

    if (!spotToRemove) {
      console.log("Parking spot with this name does not exist.");
      alert("Parking spot with this name does not exist.");
      return; // Exit if the spot does not exist
    }

    // If the spot exists, remove the parking spot from the array
    await updateDoc(officePublicRef, {
      parkingSpots: arrayRemove(spotToRemove),
    });

    console.log(
      "Parking spot removed successfully from the office with ID:",
      officeId,
    );
  } catch (error) {
    // Handle any errors
    console.error("Error removing parking spot:", error);
  }
};

export const toggleSpotAvailability = async (
  companyID: string,
  officeID: string,
  spotID: string,
): Promise<void> => {
  if (companyID && officeID && spotID) {
    try {
      // Reference to the office document
      const officeRef = doc(
        db,
        `users/${companyID}/offices/${officeID}/public/${officeID}`,
      );
      // const name = localStorage.getItem("name") || "unknown"; // Use 'unknown' if 'name' is not found
      const name = "Admin";
      const currentDate = getFormattedDate(new Date());

      const activityRef = doc(db, 
        `users/${companyID}/offices/${officeID}/activity/${currentDate}`
      );

      // Get the current state of the office document
      const officeSnap = await getDoc(officeRef);

      if (officeSnap.exists()) {
        const data = officeSnap.data() as OfficeData; // Cast the data to the OfficeData type

        // Find the index of the parking spot that needs to be updated
        const spotIndex = data.parkingSpots?.findIndex(
          (spot) => spot.name === spotID,
        );

        if (spotIndex !== undefined && spotIndex >= 0) {
          // Toggle the 'available' field of the found parking spot
          const updatedSpots = [...data.parkingSpots!]; // Copy the parkingSpots array
          updatedSpots[spotIndex] = {
            ...updatedSpots[spotIndex],
            available: !updatedSpots[spotIndex].available, // Toggle the availability
          };

          // Create the activity message object
          const activityMessage = {
            spot: spotID,
            name: name,
            timestamp: new Date(), // Current timestamp
            available: updatedSpots[spotIndex].available, // New availability status
          };

          // Update the document with the modified parkingSpots array and append the activity message
          await updateDoc(officeRef, {
            parkingSpots: updatedSpots,
            activity: arrayUnion(activityMessage), // Append the activity message
          }).then(async () => {
            // Check if all spots are unavailable and messageSent is false
          });

          await updateDoc(activityRef, {
            activity: arrayUnion(activityMessage), 
          })

          // console.log(`Successfully toggled availability of spot ${spotID}`);
        } else {
          console.error("Spot not found in the parkingSpots array.");
        }
      } else {
        console.error("No such office document!");
      }
    } catch (error) {
      console.error("Error toggling spot availability:", error);
    }
  }
};


function getFormattedDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}