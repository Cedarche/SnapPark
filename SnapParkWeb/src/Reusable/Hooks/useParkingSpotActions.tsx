import { useState } from "react";
// import { toggleSpotAvailability, generatePDF2, deleteParkingSpot, updateParkingSpotName } from 'path-to-your-api'; // Import your API functions here

import {
  toggleSpotAvailability,
  deleteParkingSpot,
  updateParkingSpotName,
} from "@/Reusable/Functions/parkingSpotFunctions";
import { generatePDF2 } from "@/Routes/Dashboard/DashComponents/PDFGeneration/GeneratePDF2";

interface ArrayItem {
  id: number;
  label: string;
  url: string;
}

export function useParkingSpotActions(
  userData: any,
  officeData: any,
  spots: any[],
) {
  const [loading, setLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const handleToggle = async (spotID: string) => {
    try {
      await toggleSpotAvailability(userData.id, officeData.id, spotID);
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const handleLink = (spotID: string) => {
    const URL = `https://snappark.co/spot/${userData.id}/${officeData.id}/${spotID}`;
    window.open(URL, "_blank"); // Opens the URL in a new tab
  };

  const handlePDFGeneration = async (spotsToGenerate: any[]) => {
    if (userData.id && officeData.id && spotsToGenerate) {
      console.log("Loading...");
      const allSpotsURL = `https://snappark.co/all/${userData.id}/${officeData.id}`;
      const URLArray: ArrayItem[] = spotsToGenerate.map((spot, index) => {
        const id = index + 1;
        const label = spot.name;
        const url = `https://snappark.co/spot/${userData.id}/${officeData.id}/${label}`;
        return { id, label, url };
      });

      try {
        setLoading(true);
        await generatePDF2(URLArray, allSpotsURL);
        setLoading(false);
      } catch (error) {
        console.error("Error generating PDF: ", error);
        setLoading(false);
      }
    }
  };

  const handleDelete = async (spotName: string) => {
    try {
      setLoading(true);
      await deleteParkingSpot(userData.id, officeData.id, spotName);
      setLoading(false);
    } catch (error) {
      console.error("Error deleting parking spot: ", error);
      setLoading(false);
    }
  };

  const handleChangeName = async (spotId: string, newName: string) => {
    if (!newName.trim()) {
      alert("The parking spot name cannot be empty.");
      return;
    }
    try {
      setUpdateLoading(true);
      await updateParkingSpotName(userData.id, officeData.id, spotId, newName);
      setSelectedRow(null);
      setUpdateLoading(false);
    } catch (error) {
      console.error("Error updating parking spot name: ", error);
      setUpdateLoading(false);
    }
  };

  return {
    handleToggle,
    handleLink,
    handlePDFGeneration,
    handleDelete,
    handleChangeName,
    selectedRow,
    setSelectedRow,
  };
}
